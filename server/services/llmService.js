import ollama from "ollama";

const LLM_MODEL = "qwen2.5:3b";

/*
 * ============================================================
 * GENERATE NORMAL ANSWER
 * ============================================================
 */

export const generateAnswer = async (prompt) => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }

  try {
    const response = await ollama.chat({
      model: LLM_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      options: {
        temperature: 0,
      },
    });

    return response.message.content;
  } catch (error) {
    console.error("LLM Generation Failed:", error.message);

    throw new Error("Failed To generate Response from Local LLM");
  }
};

/*
 * ============================================================
 * GENERATE STREAMING ANSWER
 * ============================================================
 */

export const generateAnswerStream = async (prompt) => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  try {
    const response = await ollama.chat({
      model: LLM_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
      options: {
        temperature: 0,
      },
    });

    return response;
  } catch (error) {
    console.error("LLM streaming failed:", error.message);

    throw new Error(
      "Failed to generate streaming response from local LLM.",
    );
  }
};

/*
 * ============================================================
 * CHECK CONTEXT RELEVANCE
 * ============================================================
 *
 * IMPORTANT:
 *
 * The complete retrieved context is checked TOGETHER.
 *
 * We do NOT check every document chunk separately.
 *
 * This is important for PDF/DOCX knowledge-base documents
 * because one chunk may contain only part of the answer.
 *
 * This also works with approved FAQs.
 *
 * Examples:
 *
 * FAQ:
 *   "Do you offer student discounts?"
 *
 * KB:
 *   "How Do I Get My Refund?"
 *
 * Multiple refund chunks can collectively provide the answer.
 * ============================================================
 */

export const checkContextRelevance = async (question, contexts) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  if (!Array.isArray(contexts) || contexts.length === 0) {
    return false;
  }

  /*
   * Remove empty or invalid contexts.
   */
  const validContexts = contexts
    .filter(
      (context) =>
        typeof context === "string" && context.trim().length > 0,
    )
    .map((context) => context.trim());

  if (validContexts.length === 0) {
    return false;
  }

  /*
   * Combine ALL retrieved context.
   */
  const contextText = validContexts
    .map((context, index) => `SOURCE ${index + 1}:\n${context}`)
    .join("\n\n");

  const prompt = `
You are a strict relevance checker for a customer support RAG system.

Your task is to determine whether the provided knowledge-base
context contains useful information for answering the user's question.

IMPORTANT:
The context may contain multiple sources or document chunks.

A single source does NOT need to contain the complete answer.

If one or more sources contain useful information that can answer
the question, return YES.

The answer may require combining information from multiple sources.

The question and context may use different wording, synonyms,
or paraphrased expressions.

Do NOT use outside knowledge.

User Question:
${question.trim()}

Knowledge Base Context:
${contextText}

Rules:

1. Return YES if at least one source contains information that
   directly answers the user's question.

2. Return YES if the answer can be constructed by combining
   information from multiple provided sources.

3. Return YES if the context contains semantically equivalent
   or paraphrased information.

4. Return NO only when the provided context is unrelated to
   the user's question or contains no useful information for
   answering it.

5. Do not answer the user's question.

6. Do not explain your decision.

7. Return ONLY one word:

YES

or

NO

Decision:
`;

  try {
    const response = await ollama.chat({
      model: LLM_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      options: {
        temperature: 0,
      },
    });

    const result =
      response?.message?.content?.trim().toUpperCase() || "";

    console.log(
      "RAG context relevance raw result:",
      JSON.stringify(result),
    );

    /*
     * Accept:
     *
     * YES
     * YES.
     * YES\n
     *
     * Reject:
     *
     * NO
     * NO.
     */

    if (result === "YES" || result.startsWith("YES")) {
      return true;
    }

    if (result === "NO" || result.startsWith("NO")) {
      return false;
    }

    /*
     * Unexpected response.
     * Fail closed.
     */

    console.warn(
      "Unexpected context relevance response:",
      result,
    );

    return false;
  } catch (error) {
    console.error(
      "Context relevance check failed:",
      error.message,
    );

    /*
     * If relevance checking fails,
     * do not allow unsupported information.
     */

    return false;
  }
};