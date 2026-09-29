import express from 'express';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const workerPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'services', 'speechWorker.py');
const supportedLanguages = new Set(['en', 'hi', 'mr']);
const mimeExtensions = {
  'audio/webm': '.webm',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/mpeg': '.mp3',
  'audio/mp4': '.mp4',
};

let recognizerProcess = null;
let recognizerBuffer = '';
const recognizerQueue = [];

const rejectRecognizerQueue = (error) => {
  while (recognizerQueue.length) recognizerQueue.shift().reject(error);
};

const startRecognizer = () => {
  if (recognizerProcess) return recognizerProcess;

  const pythonCommand = process.env.WHISPER_PYTHON || 'python';
  recognizerProcess = spawn(pythonCommand, [workerPath, '--persistent'], {
    env: process.env,
    windowsHide: true,
  });

  recognizerProcess.stdout.on('data', (chunk) => {
    recognizerBuffer += chunk.toString();
    const lines = recognizerBuffer.split(/\r?\n/);
    recognizerBuffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const request = recognizerQueue.shift();
      if (!request) continue;

      try {
        const result = JSON.parse(line);
        if (result.error) request.reject(new Error(result.error));
        else request.resolve(result);
      } catch {
        request.reject(new Error('Local speech recognizer returned an invalid response.'));
      }
    }
  });
  recognizerProcess.on('error', (error) => {
    recognizerProcess = null;
    rejectRecognizerQueue(error);
  });
  recognizerProcess.on('close', (code) => {
    recognizerProcess = null;
    recognizerBuffer = '';
    if (code !== 0) rejectRecognizerQueue(new Error('Local speech recognizer stopped unexpectedly.'));
  });

  return recognizerProcess;
};

const runLocalRecognizer = (audioPath, language) => new Promise((resolve, reject) => {
  const worker = startRecognizer();
  recognizerQueue.push({ resolve, reject });
  worker.stdin.write(`${JSON.stringify({ audio_path: audioPath, language })}\n`);
});

router.post('/', async (req, res) => {
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(400).json({ message: 'Audio input is required.' });
  }

  const language = typeof req.query.language === 'string' ? req.query.language.trim().toLowerCase() : '';
  if (!supportedLanguages.has(language)) {
    return res.status(400).json({ message: 'A supported speech language is required.' });
  }

  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'support-speech-'));
  const extension = mimeExtensions[req.headers['content-type']?.split(';')[0]] || '.webm';
  const audioPath = path.join(temporaryDirectory, `recording${extension}`);

  try {
    await fs.writeFile(audioPath, req.body);
    const result = await runLocalRecognizer(audioPath, language);
    return res.json({ text: result.text || '', language: result.language || null });
  } catch (error) {
    console.error('Local speech recognition failed:', error.message);
    return res.status(503).json({ message: 'Local speech recognition is unavailable.' });
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});

export default router;