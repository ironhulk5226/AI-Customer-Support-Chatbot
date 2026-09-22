import ollama from "ollama";

const LLM_MODEL = "qwen2.5:3b";

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
    });

    return response.message.content;
  } catch (error) {
    console.error("LLM Generation Failed:", error.message);
    throw new Error("Failed To generate Response from Local LLM");
  }
};

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
    });

    return response;
  } catch (error) {
    console.error("LLM streaming failed:", error.message);

    throw new Error("Failed to generate streaming response from local LLM.");
  }
};
