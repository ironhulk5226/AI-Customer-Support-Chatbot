const supportedTranslationLanguages = new Set(['hi', 'mr']);

const languageNames = {
  hi: 'Hindi',
  mr: 'Marathi',
};

const getOllamaUrl = () => {
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim() || 'http://127.0.0.1:11434';
  return `${baseUrl.replace(/\/$/, '')}/api/generate`;
};

export const normalizeInputForRag = async (message, language) => {
  if (language === 'en') return message;
  if (!supportedTranslationLanguages.has(language)) {
    throw new Error(`Unsupported translation language: ${language}`);
  }

  const response = await fetch(getOllamaUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL?.trim() || 'qwen2.5:3b',
      prompt: [
        `Translate the following ${languageNames[language]} customer support question into English.`,
        'Return only the English translation, with no explanation, labels, or quotation marks.',
        `Text: ${message}`,
      ].join('\n'),
      stream: false,
      options: { temperature: 0 },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  const translation = typeof payload.response === 'string' ? payload.response.trim() : '';

  if (!response.ok || !translation) {
    throw new Error(payload.error || 'Ollama did not return an English translation.');
  }

  return translation;
};