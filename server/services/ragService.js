import { generateEmbedding } from "./embeddingService.js";
import { searchSimilarDocuments } from "./vectorStoreService.js";
import { generateAnswer, generateAnswerStream } from "./llmService.js";

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

    Answer:`;

  return prompt.trim();
};

export const generateRAGAnswer = async (question, numberOfResults = 3) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  try {
    // Step 1: Generate embedding for the question
    const queryEmbedding = await generateEmbedding(question);

    // Step 2: Search ChromaDB
    const results = await searchSimilarDocuments(
      queryEmbedding,
      numberOfResults,
    );

    const retrievedDocuments = results.documents?.[0] || [];

    if (retrievedDocuments.length === 0) {
      return {
        answer: "The information is not available in the knowledge base.",
        sources: [],
      };
    }

    // Step 3: Build RAG prompt
    const prompt = buildRAGPrompt(question, retrievedDocuments);

    // Step 4: Generate answer using local LLM
    const answer = await generateAnswer(prompt);

    return {
      answer,
      sources: results.metadatas?.[0] || [],
    };
  } catch (error) {
    console.error("RAG answer generation failed:", error.message);

    throw new Error("Failed to generate answer using RAG.");
  }
};

export const generateRAGAnswerStream = async (
  question,
  numberOfResults = 3,
) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  try {
    // Step 1: Generate embedding for the question
    const queryEmbedding = await generateEmbedding(question);

    // Step 2: Search ChromaDB
    const results = await searchSimilarDocuments(
      queryEmbedding,
      numberOfResults,
    );

    const retrievedDocuments = results.documents?.[0] || [];

    if (retrievedDocuments.length === 0) {
      return {
        stream: null,
        sources: [],
      };
    }

    // Step 3: Build RAG prompt
    const prompt = buildRAGPrompt(question, retrievedDocuments);

    // Step 4: Start streaming response from Qwen
    const stream = await generateAnswerStream(prompt);

    return {
      stream,
      sources: results.metadatas?.[0] || [],
    };
  } catch (error) {
    console.error("RAG streaming failed:", error.message);

    throw new Error("Failed to generate streaming RAG response.");
  }
};
// generateRAGAnswerStream()
//         │
//         ├── generateEmbedding()
//         │
//         ├── searchSimilarDocuments()
//         │
//         ├── buildRAGPrompt()
//         │
//         └── generateAnswerStream()