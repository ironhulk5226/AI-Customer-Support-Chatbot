import { generateEmbedding } from "./embeddingService.js";

import { searchSimilarDocuments } from "./vectorStoreService.js";

import {
  generateAnswer,
  generateAnswerStream,
  checkContextRelevance,
} from "./llmService.js";

import { recordKnowledgeGap } from "./knowledgeGapService.js";

import { calculateGroundingScore } from "./groundingService.js";

/*
 * ============================================================
 * BUILD RAG PROMPT
 * ============================================================
 */

export const buildRAGPrompt = (question, retrievedDocuments) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  if (!retrievedDocuments || retrievedDocuments.length === 0) {
    throw new Error("Retrieved documents are required.");
  }

  const context = retrievedDocuments
    .map((document, index) => {
      return `Source ${index + 1}:
${document}`;
    })
    .join("\n\n");

  const prompt = `
You are a customer support assistant.

Answer the user's question using ONLY the information
provided in the knowledge base context below.

Do not use outside knowledge.
Do not invent or assume information.

If the answer cannot be found in the provided context,
say that the information is not available in the
knowledge base.

Knowledge Base Context:
${context}

User Question:
${question}

Answer:
`;

  return prompt.trim();
};

/*
 * ============================================================
 * KNOWLEDGE GAP DISTANCE THRESHOLD
 * ============================================================
 */

const getKnowledgeGapThreshold = () => {
  const configuredThreshold = Number.parseFloat(
    process.env.KNOWLEDGE_GAP_DISTANCE_THRESHOLD,
  );

  return Number.isFinite(configuredThreshold) ? configuredThreshold : 0.75;
};

/*
 * ============================================================
 * STRONG SIMILARITY THRESHOLD
 *
 * If the best ChromaDB distance is <= this threshold,
 * the match is considered a strong semantic match.
 *
 * Strong matches do NOT require the additional LLM
 * relevance check.
 * ============================================================
 */

const getStrongSimilarityThreshold = () => {
  const configuredThreshold = Number.parseFloat(
    process.env.RAG_STRONG_SIMILARITY_THRESHOLD,
  );

  return Number.isFinite(configuredThreshold) ? configuredThreshold : 0.5;
};

/*
 * ============================================================
 * GROUNDING THRESHOLD
 * ============================================================
 */

const getGroundingThreshold = () => {
  const configuredThreshold = Number.parseFloat(
    process.env.RAG_GROUNDING_THRESHOLD,
  );

  return Number.isFinite(configuredThreshold) ? configuredThreshold : 0.5;
};

/*
 * ============================================================
 * BUILD SOURCE METADATA
 * ============================================================
 */

const buildSourceMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }

  /*
   * Approved FAQ
   */

  if (metadata.type === "faq") {
    return {
      ...metadata,
      section: metadata.section || "FAQ",
    };
  }

  /*
   * PDF / DOCX knowledge-base chunk
   */

  if (typeof metadata.chunkIndex === "number" && !metadata.section) {
    return {
      ...metadata,
      section: `Knowledge Base Chunk ${metadata.chunkIndex + 1}`,
    };
  }

  return metadata;
};

/*
 * ============================================================
 * RECORD KNOWLEDGE GAP
 * ============================================================
 */

const handleKnowledgeGap = ({ question, bestDistance }) => {
  try {
    recordKnowledgeGap({
      originalQuestion: question.trim(),

      normalizedQuestion: question.trim().toLowerCase(),

      language: "en",

      bestDistance,
    });
  } catch (gapError) {
    console.error("Knowledge gap could not be recorded:", gapError.message);
  }
};

/*
 * ============================================================
 * NON-STREAMING RAG
 *
 * Used for Hindi / Marathi responses.
 *
 * ALSO useful for testing the complete RAG pipeline.
 * ============================================================
 */

export const generateRAGAnswer = async (
  question,
  numberOfResults = 3,
) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  try {
    /*
     * ============================================================
     * 1. GENERATE QUERY EMBEDDING
     * ============================================================
     */

    const queryEmbedding = await generateEmbedding(question);

    /*
     * ============================================================
     * 2. SEARCH VECTOR STORE
     * ============================================================
     */

    const results = await searchSimilarDocuments(
      queryEmbedding,
      numberOfResults,
    );

    const documents = results?.documents?.[0] || [];
    const metadatas = results?.metadatas?.[0] || [];
    const distances = results?.distances?.[0] || [];

    /*
     * ============================================================
     * 3. FIND BEST DISTANCE
     * ============================================================
     */

    const validDistances = distances.filter(
      (distance) => typeof distance === "number",
    );

    const bestDistance =
      validDistances.length > 0
        ? Math.min(...validDistances)
        : null;

    const knowledgeGapThreshold =
      getKnowledgeGapThreshold();

    const strongSimilarityThreshold =
      getStrongSimilarityThreshold();

    console.log(
      "RAG retrieval distances:",
      distances,
    );

    console.log(
      "RAG best distance:",
      bestDistance,
    );

    console.log(
      "RAG knowledge gap threshold:",
      knowledgeGapThreshold,
    );

    console.log(
      "RAG strong similarity threshold:",
      strongSimilarityThreshold,
    );

    console.log(
      "RAG retrieved metadata:",
      metadatas,
    );

    /*
     * ============================================================
     * 4. DISTANCE FILTER
     * ============================================================
     */

    const relevantResults = documents
      .map((document, index) => ({
        document,
        metadata: metadatas[index],
        distance: distances[index],
      }))
      .filter(
        (item) =>
          typeof item.distance === "number" &&
          item.document &&
          item.document.trim() &&
          item.distance <= knowledgeGapThreshold,
      );

    console.log(
      "RAG valid candidates:",
      relevantResults.length,
    );

    /*
     * ============================================================
     * 5. NO RELEVANT RESULTS → KNOWLEDGE GAP
     * ============================================================
     */

    if (relevantResults.length === 0) {
      handleKnowledgeGap({
        question,
        bestDistance,
      });

      return {
        answer: "",
        sources: [],
      };
    }

    /*
     * ============================================================
     * 6. RETRIEVED DOCUMENTS
     * ============================================================
     */

    const retrievedDocuments = relevantResults.map(
      (item) => item.document,
    );

    console.log(
      "RAG context documents:",
      retrievedDocuments.length,
    );

    /*
     * ============================================================
     * 7. CHECK STRONG SIMILARITY
     * ============================================================
     */

    const hasStrongSimilarity =
      bestDistance !== null &&
      bestDistance <= strongSimilarityThreshold;

    console.log(
      "RAG strong similarity match:",
      hasStrongSimilarity,
    );

    /*
     * ============================================================
     * 8. APPROVED FAQ DIRECT ANSWER
     * ============================================================
     *
     * If the strongest result is an approved FAQ and the
     * similarity is strong, return the administrator-verified
     * answer directly.
     *
     * Do NOT send an approved FAQ through the LLM.
     *
     * This is especially important for Hindi and Marathi because
     * their non-streaming path uses this function.
     * ============================================================
     */

    const strongestResult = relevantResults[0];

    if (
      hasStrongSimilarity &&
      strongestResult?.metadata?.type === "faq" &&
      strongestResult?.metadata?.evidence
    ) {
      const faqAnswer =
        strongestResult.metadata.evidence.trim();

      console.log(
        "RAG approved FAQ strong match detected in non-streaming path.",
      );

      console.log(
        "Returning verified FAQ answer directly:",
        faqAnswer,
      );

      return {
        answer: faqAnswer,
        sources: relevantResults.map((item) =>
          buildSourceMetadata(item.metadata),
        ),
      };
    }

    /*
     * ============================================================
     * 9. CONTEXT RELEVANCE CHECK
     * ============================================================
     *
     * Only perform the LLM relevance check when the similarity
     * is not strong enough.
     * ============================================================
     */

    let contextIsRelevant = true;

    if (!hasStrongSimilarity) {
      console.log(
        "RAG relevance check question:",
        question,
      );

      console.log(
        "RAG relevance check context:",
        JSON.stringify(
          retrievedDocuments,
          null,
          2,
        ),
      );

      contextIsRelevant = await checkContextRelevance(
        question,
        retrievedDocuments,
      );

      console.log(
        "RAG context relevance:",
        contextIsRelevant,
      );

      if (!contextIsRelevant) {
        handleKnowledgeGap({
          question,
          bestDistance,
        });

        return {
          answer: "",
          sources: [],
        };
      }
    } else {
      console.log(
        "RAG strong similarity detected. Skipping LLM relevance check.",
      );
    }

    /*
     * ============================================================
     * 10. BUILD SOURCES
     * ============================================================
     */

    const filteredSources = relevantResults.map(
      (item) => buildSourceMetadata(item.metadata),
    );

    /*
     * ============================================================
     * 11. BUILD RAG PROMPT
     * ============================================================
     */

    const prompt = buildRAGPrompt(
      question,
      retrievedDocuments,
    );

    console.log(
      "RAG prompt created successfully.",
    );

    console.log(
      "RAG prompt:",
      prompt,
    );

    /*
     * ============================================================
     * 12. GENERATE ANSWER USING LOCAL LLM
     * ============================================================
     */

    console.log(
      "RAG calling generateAnswer...",
    );

    const answer = await generateAnswer(prompt);

    console.log(
      "RAG generateAnswer returned successfully.",
    );

    /*
     * ============================================================
     * 13. CALCULATE GROUNDING SCORE
     * ============================================================
     *
     * Monitoring only.
     * It does NOT block the answer.
     * ============================================================
     */

    try {
      const groundingScore =
        calculateGroundingScore(
          answer,
          retrievedDocuments,
        );

      console.log(
        "RAG grounding score:",
        groundingScore,
      );
    } catch (groundingError) {
      console.warn(
        "Grounding score calculation failed:",
        groundingError.message,
      );
    }

    /*
     * ============================================================
     * 14. RETURN ANSWER + SOURCES
     * ============================================================
     */

    return {
      answer,
      sources: filteredSources,
    };
  } catch (error) {
    console.error(
      "RAG generation failed:",
      error.message,
    );

    throw new Error(
      "Failed to generate RAG response.",
    );
  }
};
/*
 * ============================================================
 * STREAMING RAG
 *
 * Used for English responses.
 *
 * Strong similarity takes priority over the LLM
 * relevance checker.
 *
 * Borderline similarity uses the LLM relevance checker.
 * ============================================================
 */

export const generateRAGAnswerStream = async (
  question,
  numberOfResults = 3,
) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  try {
    /*
     * ============================================================
     * 1. GENERATE QUERY EMBEDDING
     * ============================================================
     */

    const queryEmbedding = await generateEmbedding(question);

    /*
     * ============================================================
     * 2. SEARCH VECTOR STORE
     * ============================================================
     */

    const results = await searchSimilarDocuments(
      queryEmbedding,
      numberOfResults,
    );

    const documents = results?.documents?.[0] || [];
    const metadatas = results?.metadatas?.[0] || [];
    const distances = results?.distances?.[0] || [];

    /*
     * ============================================================
     * 3. FIND BEST DISTANCE
     * ============================================================
     */

    const validDistances = distances.filter(
      (distance) => typeof distance === "number",
    );

    const bestDistance =
      validDistances.length > 0
        ? Math.min(...validDistances)
        : null;

    const knowledgeGapThreshold = getKnowledgeGapThreshold();
    const strongSimilarityThreshold =
      getStrongSimilarityThreshold();

    console.log(
      "RAG retrieval distances:",
      distances,
    );

    console.log(
      "RAG best distance:",
      bestDistance,
    );

    console.log(
      "RAG knowledge gap threshold:",
      knowledgeGapThreshold,
    );

    console.log(
      "RAG strong similarity threshold:",
      strongSimilarityThreshold,
    );

    console.log(
      "RAG retrieved metadata:",
      metadatas,
    );

    /*
     * ============================================================
     * 4. DISTANCE FILTER
     * ============================================================
     */

    const relevantResults = documents
      .map((document, index) => ({
        document,
        metadata: metadatas[index],
        distance: distances[index],
      }))
      .filter(
        (item) =>
          typeof item.distance === "number" &&
          item.document &&
          item.document.trim() &&
          item.distance <= knowledgeGapThreshold,
      );

    console.log(
      "RAG valid candidates:",
      relevantResults.length,
    );

    console.log(
      `RAG stream distance-filtered candidates: ${relevantResults.length} of ${documents.length}`,
    );

    /*
     * ============================================================
     * 5. NO RELEVANT RESULTS → KNOWLEDGE GAP
     * ============================================================
     */

    if (relevantResults.length === 0) {
      handleKnowledgeGap({
        question,
        bestDistance,
      });

      return {
        stream: null,
        sources: [],
      };
    }

    /*
     * ============================================================
     * 6. RETRIEVED DOCUMENTS
     * ============================================================
     */

    const retrievedDocuments = relevantResults.map(
      (item) => item.document,
    );

    console.log(
      "RAG context documents:",
      retrievedDocuments.length,
    );

    /*
     * ============================================================
     * 7. STRONG SIMILARITY
     * ============================================================
     */

    const hasStrongSimilarity =
      bestDistance !== null &&
      bestDistance <= strongSimilarityThreshold;

    console.log(
      "RAG strong similarity match:",
      hasStrongSimilarity,
    );

    /*
     * ============================================================
     * 8. APPROVED FAQ DIRECT ANSWER
     * ============================================================
     *
     * IMPORTANT:
     *
     * If the strongest result is an approved FAQ and its
     * similarity is strong, return the administrator-verified
     * FAQ evidence directly.
     *
     * DO NOT send it through the LLM.
     *
     * This prevents the local LLM from replacing a verified
     * answer with an incorrect "information unavailable"
     * response.
     * ============================================================
     */

    const strongestResult = relevantResults[0];

    if (
      hasStrongSimilarity &&
      strongestResult?.metadata?.type === "faq" &&
      strongestResult?.metadata?.evidence
    ) {
      const faqAnswer =
        strongestResult.metadata.evidence.trim();

      console.log(
        "RAG approved FAQ strong match detected.",
      );

      console.log(
        "Returning verified FAQ answer directly:",
        faqAnswer,
      );

      async function* faqAnswerStream() {
        yield {
          message: {
            role: "assistant",
            content: faqAnswer,
          },
          done: false,
        };

        yield {
          message: {
            role: "assistant",
            content: "",
          },
          done: true,
        };
      }

      return {
        stream: faqAnswerStream(),
        sources: relevantResults.map((item) =>
          buildSourceMetadata(item.metadata),
        ),
      };
    }

    /*
     * ============================================================
     * 9. CONTEXT RELEVANCE CHECK
     * ============================================================
     *
     * Only run this when similarity is not strong.
     * Strong similarity already provides enough confidence.
     * ============================================================
     */

    let contextIsRelevant = true;

    if (!hasStrongSimilarity) {
      console.log(
        "RAG relevance check question:",
        question,
      );

      console.log(
        "RAG relevance check context:",
        JSON.stringify(
          retrievedDocuments,
          null,
          2,
        ),
      );

      contextIsRelevant = await checkContextRelevance(
        question,
        retrievedDocuments,
      );

      console.log(
        "RAG context relevance:",
        contextIsRelevant,
      );

      if (!contextIsRelevant) {
        handleKnowledgeGap({
          question,
          bestDistance,
        });

        return {
          stream: null,
          sources: [],
        };
      }
    } else {
      console.log(
        "RAG strong similarity detected. Skipping LLM relevance check.",
      );
    }

    /*
     * ============================================================
     * 10. BUILD RAG SOURCES
     * ============================================================
     */

    const filteredSources = relevantResults.map(
      (item) => buildSourceMetadata(item.metadata),
    );

    /*
     * ============================================================
     * 11. BUILD RAG PROMPT
     * ============================================================
     */

    const prompt = buildRAGPrompt(
      question,
      retrievedDocuments,
    );

    console.log(
      "RAG prompt created successfully.",
    );

    console.log(
      "RAG prompt:",
      prompt,
    );

    /*
     * ============================================================
     * 12. GENERATE LLM STREAM
     * ============================================================
     */

    console.log(
      "RAG calling generateAnswerStream...",
    );

    const stream = await generateAnswerStream(
      prompt,
    );

    console.log(
      "RAG generateAnswerStream returned successfully.",
    );

    return {
      stream,
      sources: filteredSources,
    };
  } catch (error) {
    console.error(
      "RAG streaming failed:",
      error.message,
    );

    throw new Error(
      "Failed to generate RAG streaming response.",
    );
  }
};