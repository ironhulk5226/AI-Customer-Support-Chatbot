const normalizeText = (text = "") => {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const getMeaningfulWords = (text) => {
    const stopWords = new Set([
        "the",
        "a",
        "an",
        "is",
        "are",
        "was",
        "were",
        "to",
        "of",
        "in",
        "on",
        "for",
        "and",
        "or",
        "with",
        "this",
        "that",
        "it",
        "as",
        "be",
        "from",
        "by",
        "your",
        "you",
    ]);

    return new Set(
        normalizeText(text)
            .split(" ")
            .filter((word) => word.length > 2 && !stopWords.has(word))
    );
};

export const calculateGroundingScore = (
    answer,
    retrievedDocuments = []
) => {
    if (!answer || !answer.trim() || retrievedDocuments.length === 0) {
        return 0;
    }

    const answerWords = getMeaningfulWords(answer);

    if (answerWords.size === 0) {
        return 0;
    }

    const contextWords = getMeaningfulWords(
        retrievedDocuments.join(" ")
    );

    if (contextWords.size === 0) {
        return 0;
    }

    let supportedWords = 0;

    for (const word of answerWords) {
        if (contextWords.has(word)) {
            supportedWords += 1;
        }
    }

    return Number(
        (supportedWords / answerWords.size).toFixed(2)
    );
};