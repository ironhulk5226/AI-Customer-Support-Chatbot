import ollama from "ollama"

const EMBEDDING_MODEL = "nomic-embed-text";

export const generateEmbedding = async(text) => {
    if(!text || !text.trim()){
        throw new Error("Text is required for for embedding generation")
    }
    try {
        const response = await ollama.embed({
            model:EMBEDDING_MODEL,
            input:text
        });

        return response.embeddings[0];

    } catch (error) {
        console.error("Embedding generation failed", error.message);

        throw new Error("Failed to generate document embedding.");
    }


}