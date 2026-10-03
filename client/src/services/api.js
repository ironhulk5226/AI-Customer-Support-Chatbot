import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export async function sendMessage(message, language = "en") {
  const response = await api.post(
    "/api/chat",
    {
      message,
      language,
    },
    {
      timeout: 120000,
    },
  );

  return response.data;
}

export async function sendMessageStream(
  message,
  language = "en",
  {
    onToken,
    onSources,
    onComplete,
  } = {},
) {
  const token = sessionStorage.getItem("token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify({
        message,
        language,
      }),
    },
  );

  if (!response.ok) {
    let errorMessage = "Failed to process chat request.";

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  /*
   * The backend can return either:
   *
   * 1. text/event-stream -> normal English streaming response
   * 2. application/json   -> knowledge-gap fallback response
   *
   * Handle both cases explicitly.
   */
  const contentType = response.headers.get("content-type") || "";

  /*
   * CASE 1: Normal JSON response
   *
   * This happens when the RAG pipeline determines that
   * the question is not available in the knowledge base.
   */
  if (contentType.includes("application/json")) {
    const data = await response.json();

    const answer = data.answer || data.text || "";
    const sources = data.sources || [];

    onSources?.(sources, data.language || language);

    onComplete?.({
      ...data,
      answer,
      sources,
      language: data.language || language,
    });

    return;
  }

  /*
   * CASE 2: Server-Sent Events streaming response
   */
  if (!response.body) {
    throw new Error("Streaming response is not available.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  const processEvent = (eventText) => {
    const lines = eventText.split(/\r?\n/);

    let eventName = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        data += line.slice(5).trim();
      }
    }

    if (!data) {
      return;
    }

    try {
      const parsedData = JSON.parse(data);

      if (eventName === "token") {
        onToken?.(parsedData.text || "");
      } else if (eventName === "sources") {
        onSources?.(
          parsedData.sources || [],
          parsedData.language || language,
        );
      } else if (eventName === "complete") {
        onComplete?.(parsedData);
      } else if (eventName === "error") {
        throw new Error(
          parsedData.message ||
            "Failed while generating the response.",
        );
      }
    } catch (error) {
      if (eventName === "error") {
        throw error;
      }

      console.error(
        "Failed to parse streaming event:",
        error,
      );
    }
  };

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const events = buffer.split("\n\n");

    buffer = events.pop() || "";

    for (const eventText of events) {
      if (eventText.trim()) {
        processEvent(eventText);
      }
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    processEvent(buffer);
  }
}

export async function transcribeAudio(audioBlob, language = "en") {
  const response = await api.post("/api/speech", audioBlob, {
    params: {
      language,
    },
    headers: {
      "Content-Type": audioBlob.type || "audio/webm",
    },
    timeout: 120000,
    transformRequest: [(data) => data],
  });

  return response.data;
}

export async function translateTexts(texts, target = "en") {
  const translations = [];

  for (let index = 0; index < texts.length; index += 100) {
    const response = await api.post("/api/translate", {
      texts: texts.slice(index, index + 100),
      target,
    });

    translations.push(...(response.data.translations || []));
  }

  return translations;
}

export async function submitFeedback(conversationId, messageId, feedback) {
  const response = await api.post("/api/feedback", {
    conversationId,
    messageId,
    feedback,
  });

  return response.data;
}

export async function getConversations() {
  const response = await api.get("/api/conversations");

  return response.data.conversations || response.data || [];
}

export async function getConversation(id) {
  const response = await api.get(`/api/conversations/${id}`);

  return response.data.conversation || response.data || null;
}

export async function saveConversation(payload) {
  const response = await api.post("/api/conversations", payload);

  return response.data;
}

export async function getKnowledgeGaps(status) {
  const response = await api.get("/api/knowledge-gaps", {
    params: status ? { status } : {},
  });

  return response.data.knowledgeGaps || [];
}

export async function getDocuments() {
    const response = await api.get("/api/documents");
    return response.data.documents || response.data || [];
}

export async function uploadDocument(file) {
    const formData = new FormData();
    formData.append("document", file);

    const response = await api.post("/api/documents/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
    });

    return response.data;
}

export async function deleteDocument(id) {
    const response = await api.delete(`/api/documents/${id}`);
    return response.data;
}

export async function getFAQs() {
    const response = await api.get("/api/faqs");
    return response.data.faqs || response.data || [];
}

export async function createFAQ(payload) {
    const response = await api.post("/api/faqs", payload);
    return response.data;
}

export async function updateFAQ(id, payload) {
    const response = await api.put(`/api/faqs/${id}`, payload);
    return response.data;
}

export async function rejectFAQ(id) {
    const response = await api.patch(`/api/faqs/${id}/reject`);
    return response.data;
}

export async function approveFAQ(id) {
    const response = await api.patch(`/api/faqs/${id}/approve`);
    return response.data;
}

export async function generateFAQ(payload) {
    const response = await api.post("/api/faqs/generate", payload);
    return response.data;
}

export default api;
