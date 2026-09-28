import express from 'express';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const workerPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'services', 'speechWorker.py');
const mimeExtensions = {
  'audio/webm': '.webm',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/mpeg': '.mp3',
  'audio/mp4': '.mp4',
};

const runLocalRecognizer = (audioPath) => new Promise((resolve, reject) => {
  const pythonCommand = process.env.WHISPER_PYTHON || 'python';
  const worker = spawn(pythonCommand, [workerPath, audioPath], {
    env: process.env,
    windowsHide: true,
  });
  let output = '';
  let errorOutput = '';

  worker.stdout.on('data', (chunk) => { output += chunk.toString(); });
  worker.stderr.on('data', (chunk) => { errorOutput += chunk.toString(); });
  worker.on('error', reject);
  worker.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(errorOutput.trim() || 'Local speech recognizer failed.'));
      return;
    }

    try {
      resolve(JSON.parse(output));
    } catch {
      reject(new Error('Local speech recognizer returned an invalid response.'));
    }
  });
});

router.post('/', async (req, res) => {
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    return res.status(400).json({ message: 'Audio input is required.' });
  }

  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'support-speech-'));
  const extension = mimeExtensions[req.headers['content-type']?.split(';')[0]] || '.webm';
  const audioPath = path.join(temporaryDirectory, `recording${extension}`);

  try {
    await fs.writeFile(audioPath, req.body);
    const result = await runLocalRecognizer(audioPath);
    return res.json({ text: result.text || '', language: result.language || null });
  } catch (error) {
    console.error('Local speech recognition failed:', error.message);
    return res.status(503).json({ message: 'Local speech recognition is unavailable.' });
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});

export default router;