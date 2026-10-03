import express from 'express';

const router = express.Router();
const allowedLanguages = ['en', 'hi', 'mr'];
const sarvamLanguageCodes = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

router.post('/', async (req, res) => {
  const target = typeof req.body?.target === 'string' ? req.body.target.trim().toLowerCase() : '';
  const texts = Array.isArray(req.body?.texts)
    ? req.body.texts.filter((text) => typeof text === 'string' && text.trim()).slice(0, 128)
    : [];

  if (!allowedLanguages.includes(target) || !texts.length) {
    return res.status(400).json({ message: 'A supported target language and at least one text are required.' });
  }

  if (target === 'en') {
    return res.json({ translations: texts });
  }

  const sarvamApiKey = process.env.SARVAM_API_KEY?.trim();
  if (!sarvamApiKey) {
    return res.status(503).json({ message: 'Sarvam AI is not configured. Add SARVAM_API_KEY to the server environment.' });
  }

  try {
    const translations = await Promise.all(texts.map(async (text) => {
      const response = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        headers: {
          'api-subscription-key': sarvamApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          source_language_code: 'en-IN',
          target_language_code: sarvamLanguageCodes[target],
          speaker_gender: 'Male',
        }),
      });

      const payload = await response.json();
      if (!response.ok || typeof payload.translated_text !== 'string') {
        throw new Error(payload.error || 'Sarvam AI did not return a translation.');
      }

      return payload.translated_text;
    }));

    return res.json({ translations });
  } catch (error) {
    return res.status(502).json({ message: 'Unable to reach Sarvam AI.' });
  }
});

export default router;