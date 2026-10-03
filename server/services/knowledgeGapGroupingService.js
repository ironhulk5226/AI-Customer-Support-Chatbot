const stopWords = new Set([
  'a', 'an', 'and', 'can', 'do', 'does', 'how', 'i', 'is', 'me', 'my',
  'the', 'to', 'want', 'where', 'with', 'would',
]);

const canonicalWords = new Map([
  ['change', 'change'],
  ['changing', 'change'],
  ['changes', 'change'],
  ['modify', 'change'],
  ['modifying', 'change'],
  ['update', 'change'],
  ['updating', 'change'],
  ['updates', 'change'],
]);

const getTokens = (question) => question
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .map((word) => canonicalWords.get(word) || word)
  .filter((word) => word && !stopWords.has(word));

const getTokenSet = (question) => new Set(getTokens(question));

const getJaccardSimilarity = (left, right) => {
  const leftTokens = getTokenSet(left);
  const rightTokens = getTokenSet(right);
  if (!leftTokens.size || !rightTokens.size) return 0;

  const intersectionSize = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const unionSize = new Set([...leftTokens, ...rightTokens]).size;
  return intersectionSize / unionSize;
};

export const findSimilarKnowledgeGap = (gaps, normalizedQuestion, threshold = 0.5) => {
  const exactMatch = gaps.find((gap) => gap.normalizedQuestion === normalizedQuestion);
  if (exactMatch) return exactMatch;

  return gaps.find((gap) => getJaccardSimilarity(gap.normalizedQuestion, normalizedQuestion) >= threshold) || null;
};
