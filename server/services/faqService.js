import ollama from "ollama";

const LLM_MODEL = "qwen2.5:3b";

export const generateFAQDraft = async (question) => {
    if (!question || !question.trim()) {
        throw new Error("Question is required.");
    }

const prompt = `
    You are an AI assistant helping an administrator create a customer support FAQ draft.

A customer asked the following question, but the knowledge base does not currently contain
reliable information to answer it.

Customer Question:
${question.trim()}

Your task is to prepare a safe FAQ draft for administrator review.

Return the response in exactly this format:

Question: <clear FAQ question>

Answer: Administrator input required to provide a verified answer.

Rules:
- Rewrite the customer question into a clear and concise FAQ question.
- Do NOT answer the customer's question.
- Do NOT invent or assume company policies, procedures, prices, refund periods, guarantees,
  contact information, URLs, eligibility rules, or other organization-specific information.
- Do NOT provide generic customer-support instructions.
- The Answer must remain exactly:
  "Administrator input required to provide a verified answer."
- Keep the Question concise and professional.
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
            options: {
                temperature: 0,
            },
        });

        const content = response.message?.content?.trim();

        if (!content) {
            throw new Error("The local LLM returned an empty response.");
        }

        const questionMatch = content.match(
            /Question:\s*(.*?)(?:\n|$)/i
        );

        const answerMatch = content.match(
            /Answer:\s*([\s\S]*)/i
        );

        const generatedQuestion =
            questionMatch?.[1]?.trim() || question.trim();

        const generatedAnswer =
            answerMatch?.[1]?.trim() || "Administrator input required to provide a verified answer.";

        return {
            question: generatedQuestion,
            answer: generatedAnswer,
        };
    } catch (error) {
        console.error("FAQ draft generation failed:", error.message);

        throw new Error("Failed to generate FAQ draft.");
    }
};