import ollama from "ollama";

const NORMALIZATION_MODEL = "qwen2.5:3b";

const TRANSLATION_SERVICE_URL =
    process.env.TRANSLATION_SERVICE_URL || "http://127.0.0.1:7000";

const SUPPORTED_LANGUAGES = ["en", "hi", "mr"];

const normalizeLanguage = (language) => {
    if (SUPPORTED_LANGUAGES.includes(language)) {
        return language;
    }

    return "en";
};

const parseJsonResponse = (content) => {
    const cleaned = content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start !== -1 && end !== -1 && end > start) {
            return JSON.parse(cleaned.slice(start, end + 1));
        }

        throw new Error("Normalization model returned invalid JSON.");
    }
};

const detectLanguage = (text, modelDetectedLanguage) => {
    const normalizedText = text
        .toLowerCase()
        .replace(/[^\p{L}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    const words = new Set(normalizedText.split(" "));

    const hasDevanagari = /[\u0900-\u097F]/.test(text);

    const marathiIndicators = [
        "मला",
        "माझा",
        "माझी",
        "माझे",
        "कसा",
        "कशी",
        "कसे",
        "कुठे",
        "काय",
        "आहे",
        "आहेत",
        "म्हणजे",
        "पाहिजे",
        "मिळेल",
        "करायचा",
        "करायची",
        "करायचे",
    ];

    const hindiIndicators = [
        "मुझे",
        "मेरा",
        "मेरी",
        "मेरे",
        "मुझको",
        "कैसे",
        "कहाँ",
        "क्या",
        "है",
        "हैं",
        "चाहिए",
        "मिलेगा",
        "मिलेंगे",
        "करना",
        "करनी",
        "करने",
    ];

    const romanMarathiIndicators = [
        "mala",
        "majha",
        "majhi",
        "majhe",
        "kasa",
        "kashi",
        "kashe",
        "kuthe",
        "kay",
        "ahe",
        "aahe",
        "mhanje",
        "pahije",
        "milel",
        "karaycha",
        "karaychi",
        "karayche",
    ];

    const romanHindiIndicators = [
        "mujhe",
        "mera",
        "meri",
        "mere",
        "mujhko",
        "kaise",
        "kahan",
        "kya",
        "hai",
        "hain",
        "chahiye",
        "milega",
        "milenge",
        "karna",
        "karni",
        "karne",
    ];

    if (hasDevanagari) {
        const marathiScore = marathiIndicators.filter((word) =>
            text.includes(word),
        ).length;

        const hindiScore = hindiIndicators.filter((word) =>
            text.includes(word),
        ).length;

        if (marathiScore > hindiScore && marathiScore > 0) {
            return "mr";
        }

        if (hindiScore > marathiScore && hindiScore > 0) {
            return "hi";
        }

        return modelDetectedLanguage;
    }

    const marathiScore = romanMarathiIndicators.filter((word) =>
        words.has(word),
    ).length;

    const hindiScore = romanHindiIndicators.filter((word) =>
        words.has(word),
    ).length;

    if (marathiScore > hindiScore && marathiScore > 0) {
        return "minglish";
    }

    if (hindiScore > marathiScore && hindiScore > 0) {
        return "hinglish";
    }

    return modelDetectedLanguage;
};

/*
 * ------------------------------------------------------------
 * IndicTrans2 HTTP Translation
 * ------------------------------------------------------------
 */

const translateWithIndicTrans = async ({
    text,
    sourceLanguage,
    targetLanguage,
}) => {
    const response = await fetch(
        `${TRANSLATION_SERVICE_URL}/translate`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
                text,
                sourceLanguage,
                targetLanguage,
            }),
        },
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Translation service returned ${response.status}: ${errorText}`,
        );
    }

    const data = await response.json();

    if (!data.translatedText) {
        throw new Error("Translation service returned empty text.");
    }

    return data.translatedText.trim();
};

/*
 * ------------------------------------------------------------
 * User Query Normalization
 * ------------------------------------------------------------
 *
 * Flow:
 *
 * English
 *     → English
 *
 * Hindi Devanagari
 *     → IndicTrans2
 *     → English
 *
 * Marathi Devanagari
 *     → IndicTrans2
 *     → English
 *
 * Hinglish / Minglish
 *     → Qwen normalization
 *     → English
 */

export const normalizeUserQuery = async (text) => {
    if (!text || !text.trim()) {
        throw new Error("Text is required for query normalization.");
    }

    const input = text.trim();

    /*
     * First use Qwen only for language/style detection
     * and Romanized-language normalization.
     */
    const prompt = `
You are a multilingual customer-support query normalization service.

Your task is to identify the language/style of the user's message and convert its meaning into clear English for semantic search.

Supported input styles:

- English: English written in Latin/Roman script
- Hindi: Hindi written in Devanagari script
- Marathi: Marathi written in Devanagari script
- Hinglish: Hindi written in Roman/Latin script, optionally mixed with English
- Minglish: Marathi written in Roman/Latin script, optionally mixed with English

Important rules:

1. Preserve the user's actual meaning.
2. Do not answer the user's question.
3. Do not add information.
4. Do not remove important details.
5. Translate Romanized Hindi/Marathi naturally into English.
6. Mixed Hindi-English and Marathi-English phrases must be understood by meaning.
7. If the message contains English technical/product/support terms, preserve their meaning correctly.
8. "Hinglish" and "Minglish" are input styles, not separate output languages.
9. Determine the output detectedLanguage primarily from the script used by the user.
10. If the message is written in Devanagari script and is Hindi, return "hi".
11. If the message is written in Devanagari script and is Marathi, return "mr".
12. If Hindi is written using Roman/Latin characters, return "hinglish".
13. If Marathi is written using Roman/Latin characters, return "minglish".
14. English words may be mixed into Hinglish or Minglish; this does not change the classification.
15. Roman/Latin script Hindi MUST be classified as "hinglish", not "hi".
16. Roman/Latin script Marathi MUST be classified as "minglish", not "mr".
17. If the message is ordinary English, return "en".
18. Never use "hi" or "mr" for a Romanized Hindi or Marathi message.

Return ONLY valid JSON in exactly this structure:

{
    "detectedLanguage": "en|hi|mr|hinglish|minglish",
    "englishText": "clear English version of the user's message"
}

User message:

${input}
`.trim();

    try {
        const response = await ollama.chat({
            model: NORMALIZATION_MODEL,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            options: {
                temperature: 0,
            },
        });

        const result = parseJsonResponse(
            response.message?.content || "",
        );

        const modelDetectedLanguage = [
            "en",
            "hi",
            "mr",
            "hinglish",
            "minglish",
        ].includes(result.detectedLanguage)
            ? result.detectedLanguage
            : "en";

        const detectedLanguage = detectLanguage(
            input,
            modelDetectedLanguage,
        );

        /*
         * English does not need translation.
         */
        if (detectedLanguage === "en") {
            return {
                originalText: input,
                detectedLanguage: "en",
                englishText: input,
            };
        }

        /*
         * Devanagari Hindi → English
         */
        if (detectedLanguage === "hi") {
            const englishText = await translateWithIndicTrans({
                text: input,
                sourceLanguage: "hin_Deva",
                targetLanguage: "eng_Latn",
            });

            return {
                originalText: input,
                detectedLanguage: "hi",
                englishText,
            };
        }

        /*
         * Devanagari Marathi → English
         */
        if (detectedLanguage === "mr") {
            const englishText = await translateWithIndicTrans({
                text: input,
                sourceLanguage: "mar_Deva",
                targetLanguage: "eng_Latn",
            });

            return {
                originalText: input,
                detectedLanguage: "mr",
                englishText,
            };
        }

        /*
         * Hinglish / Minglish:
         *
         * Qwen handles Romanized normalization because
         * IndicTrans2 expects Indic-script input.
         */
        const englishText =
            typeof result.englishText === "string" &&
            result.englishText.trim()
                ? result.englishText.trim()
                : input;

        return {
            originalText: input,
            detectedLanguage,
            englishText,
        };
    } catch (error) {
        console.error(
            "User query normalization failed:",
            error.message,
        );

        throw new Error(
            "Failed to normalize multilingual query.",
        );
    }
};

/*
 * ------------------------------------------------------------
 * Answer Translation
 * ------------------------------------------------------------
 *
 * English
 *     → English: return directly
 *
 * English
 *     → Hindi/Marathi: IndicTrans2
 *
 * For Hinglish/Minglish:
 *     English answer
 *         ↓
 *     Qwen
 *         ↓
 *     Romanized Hindi/Marathi
 *
 * This preserves the existing Romanized conversational
 * behavior while IndicTrans2 handles proper Indic scripts.
 */

export const translateAnswer = async (
    englishText,
    targetLanguage = "en",
    inputStyle = "en",
) => {
    if (!englishText || !englishText.trim()) {
        throw new Error(
            "English answer is required for translation.",
        );
    }

    const normalizedTarget = normalizeLanguage(targetLanguage);

    if (normalizedTarget === "en") {
        return englishText.trim();
    }

    /*
     * Romanized Hindi output
     */
    if (
        normalizedTarget === "hi" &&
        inputStyle === "hinglish"
    ) {
        const prompt = `
Translate the following grounded customer-support answer into natural conversational Hinglish.

Rules:
1. Preserve the exact meaning.
2. Do not add facts.
3. Do not remove facts.
4. Keep numbers, dates, names, product names and policy details unchanged.
5. Use Hindi grammar and vocabulary naturally.
6. Use Roman/Latin script only.
7. Keep common English customer-support terms such as refund, order, account and support in English when natural.
8. Do not use Devanagari script.

English answer:

${englishText}
`.trim();

        try {
            const response = await ollama.chat({
                model: NORMALIZATION_MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                options: {
                    temperature: 0,
                },
            });

            const translatedText =
                response.message?.content?.trim();

            if (!translatedText) {
                throw new Error(
                    "Romanized Hindi translation returned empty text.",
                );
            }

            return translatedText;
        } catch (error) {
            console.error(
                "Hinglish answer translation failed:",
                error.message,
            );

            throw new Error(
                "Failed to translate chatbot response.",
            );
        }
    }

    /*
     * Romanized Marathi output
     */
    if (
        normalizedTarget === "mr" &&
        inputStyle === "minglish"
    ) {
        const prompt = `
Translate the following grounded customer-support answer into natural conversational Minglish.

Rules:
1. Preserve the exact meaning.
2. Do not add facts.
3. Do not remove facts.
4. Keep numbers, dates, names, product names and policy details unchanged.
5. Use Marathi grammar and vocabulary naturally.
6. Use Roman/Latin script only.
7. Keep common English customer-support terms such as refund, order, account and support in English when natural.
8. Do not use Devanagari script.

English answer:

${englishText}
`.trim();

        try {
            const response = await ollama.chat({
                model: NORMALIZATION_MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                options: {
                    temperature: 0,
                },
            });

            const translatedText =
                response.message?.content?.trim();

            if (!translatedText) {
                throw new Error(
                    "Romanized Marathi translation returned empty text.",
                );
            }

            return translatedText;
        } catch (error) {
            console.error(
                "Minglish answer translation failed:",
                error.message,
            );

            throw new Error(
                "Failed to translate chatbot response.",
            );
        }
    }

    /*
     * Proper Hindi → IndicTrans2
     */
    if (normalizedTarget === "hi") {
        return translateWithIndicTrans({
            text: englishText.trim(),
            sourceLanguage: "eng_Latn",
            targetLanguage: "hin_Deva",
        });
    }

    /*
     * Proper Marathi → IndicTrans2
     */
    if (normalizedTarget === "mr") {
        return translateWithIndicTrans({
            text: englishText.trim(),
            sourceLanguage: "eng_Latn",
            targetLanguage: "mar_Deva",
        });
    }

    return englishText.trim();
};