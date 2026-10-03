import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import {
  getConversations,
  getConversation,
  saveConversation,
  sendMessage,
  sendMessageStream,
  submitFeedback,
  transcribeAudio,
} from "../services/api";
import SourceEvidence from "./SourceEvidence";
import RecentConversations from "./RecentConversations";

const suggestionMap = {
  en: [
    "How can I reset my password?",
    "How do I update my account?",
    "How Do I Get My Refund?",
    "How do I contact support?",
  ],
  hi: [
    "मैं अपना पासवर्ड कैसे रीसेट कर सकता हूँ?",
    "मैं अपना खाता कैसे अपडेट कर सकता हूँ?",
    "मुझे मेरा रिफंड कैसे मिलेगा?",
    "मैं सहायता से कैसे संपर्क कर सकता हूँ?",
  ],
  mr: [
    "मी माझा पासवर्ड कसे रीसेट करू?",
    "मी माझे खाते कसे अपडेट करू?",
    "मला माझा रिफंड कसा मिळेल?",
    "मी समर्थनाशी कसे संपर्क करू?",
  ],
};

const chatbotLabels = {
  en: {
    refresh: "Refresh history",
    newConversation: "New chat",
    supportAssistant: "Support Assistant",
    ready: "Ready",
    banner: "Ask about billing, passwords, or account settings",
    search: "Search",
    placeholder: "Message SupportAI...",
    thinking: "Thinking...",
    listening: "Listening...",
    transcribing: "Transcribing locally...",
    transcribed: "Text ready to review",
    voiceError: "Voice input could not be transcribed.",
  },
  hi: {
    refresh: "इतिहास ताज़ा करें",
    newConversation: "नई चैट",
    supportAssistant: "सपोर्ट असिस्टेंट",
    ready: "तैयार",
    banner: "बिलिंग, पासवर्ड या अकाउंट सेटिंग्स के बारे में पूछें",
    search: "खोजें",
    placeholder: "SupportAI को संदेश लिखें...",
    thinking: "सोच रहा है...",
    listening: "सुन रहा है...",
    transcribing: "स्थानीय रूप से लिप्यंतरण हो रहा है...",
    transcribed: "टेक्स्ट समीक्षा के लिए तैयार है",
    voiceError: "वॉयस इनपुट का लिप्यंतरण नहीं हो सका।",
  },
  mr: {
    refresh: "इतिहास रिफ्रेश करा",
    newConversation: "नवीन चॅट",
    supportAssistant: "समर्थन सहाय्यक",
    ready: "तयार",
    banner: "बिलिंग, पासवर्ड किंवा खाते सेटिंग्जबद्दल विचारा",
    search: "शोध",
    placeholder: "SupportAI वर संदेश लिहा...",
    thinking: "विचार करीत आहे...",
    listening: "ऐकत आहे...",
    transcribing: "स्थानिक लिप्यंतरण सुरू आहे...",
    transcribed: "टेक्स्ट तपासण्यासाठी तयार आहे",
    voiceError: "व्हॉइस इनपुटचे लिप्यंतरण होऊ शकले नाही.",
  },
};

const createMessageId = (prefix = "assistant") =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const normalizeSource = (source, index = 0) => {
  if (!source || typeof source !== "object") {
    return null;
  }

  const isNoSource = source.noSource === true;

  const document = isNoSource
    ? "No source available"
    : typeof source.document === "string" && source.document.trim()
      ? source.document.trim()
      : typeof source.documentName === "string" && source.documentName.trim()
        ? source.documentName.trim()
        : typeof source.name === "string" && source.name.trim()
          ? source.name.trim()
          : `Source ${index + 1}`;

  const section =
    typeof source.section === "string" && source.section.trim()
      ? source.section.trim()
      : "";

  const evidence =
    typeof source.evidence === "string" && source.evidence.trim()
      ? source.evidence.trim()
      : "";

  return {
    document,
    section,
    evidence,
    noSource: isNoSource,
  };
};

const normalizeSources = (sources) => {
  if (!Array.isArray(sources)) {
    return [];
  }

  return sources.map(normalizeSource).filter(Boolean);
};

const serializeMessageText = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(serializeMessageText).join("");
  }

  if (value && typeof value === "object") {
    return serializeMessageText(value.props?.children);
  }

  return "";
};

/*
 * TEMPORARY DEMO ANSWER
 *
 * Kept commented for reference only.
 * The real chatbot now starts with an empty conversation
 * and receives answers from the RAG backend.
 *
const defaultAnswer = {
  id: createMessageId('assistant'),
  text: (
    <>
      To reset your password, open your{' '}
      <mark>Account Settings</mark> and select the{' '}
      <mark className="violet-mark">Password Recovery</mark> option.
      A secure reset link will be sent to your registered email address.
    </>
  ),
  source: 'Account Help Guide.pdf',
  section: 'Password Reset',
  evidence:
    '“Password reset instructions are available under Account Settings → Security & Access.”',
  sources: [
    {
      document: 'Account Help Guide.pdf',
      section: 'Password Reset',
      evidence:
        '“Password reset instructions are available under Account Settings → Security & Access.”',
    },
  ],
  feedback: null,
}
*/

const formatMessageTime = (timestamp, language = "en") => {
  if (!timestamp) {
    return language === "hi" ? "अभी" : language === "mr" ? "आता" : "Just now";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return language === "hi" ? "अभी" : language === "mr" ? "आता" : "Just now";
  }

  return new Intl.DateTimeFormat(
    language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
};

function UserMessage({ text, timestamp, language = "en" }) {
  const timeLabel = formatMessageTime(timestamp, language);

  return (
    <div className="message-in flex max-w-[85%] items-start justify-end gap-2.5 self-end">
      <div className="flex flex-col items-end">
        <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-2.5 text-[14px] font-medium leading-relaxed text-white shadow-md shadow-indigo-500/20">
          {text}
        </div>

        <span className="mt-1 font-mono text-[11px] text-slate-400">
          {timeLabel}
        </span>
      </div>

      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-sm ring-2 ring-indigo-200">
        <Icon name="user" size={15} />
      </div>
    </div>
  );
}

function AssistantMessage({
  answer = {},
  onFeedback = () => {},
  isSubmitting = false,
  language = "en",
}) {
  const visibleSources = normalizeSources(answer.sources);
  const fallbackSources = [];

  if (
    !visibleSources.length &&
    (answer.source || answer.document || answer.section || answer.evidence)
  ) {
    fallbackSources.push({
      document: answer.document || answer.source,
      section: answer.section || "",
      evidence: answer.evidence || "",
    });
  }

  const sourcesToRender =
    visibleSources.length > 0
      ? visibleSources
      : fallbackSources.length > 0
        ? fallbackSources
        : [{ noSource: true }];

  const selectedFeedback = answer.feedback || null;

  return (
    <div className="message-in flex max-w-[92%] items-start gap-3 self-start">
      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Icon name="robot" size={16} />
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        <div className="rounded-2xl rounded-tl-sm border border-indigo-100/70 border-l-4 border-l-violet-600 bg-slate-50/90 p-4 text-[14px] leading-relaxed text-slate-800 shadow-sm">
          {answer.text}
        </div>

        {sourcesToRender.length > 0 && (
          <SourceEvidence sources={sourcesToRender} />
        )}

        <div className="flex items-center justify-between px-1 text-[12px] text-slate-400">
          <span className="font-mono text-[11px]">
            {formatMessageTime(answer.timestamp, language)}
          </span>
          <div className="flex items-center gap-2">
            <span>
              {language === "hi"
                ? "क्या यह मददगार था?"
                : language === "mr"
                  ? "हे उपयुक्त होते का?"
                  : "Was this helpful?"}
            </span>

            <button
              type="button"
              className={`rounded-md border px-2 py-1 transition-colors ${
                selectedFeedback === "helpful"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
              }`}
              onClick={() => onFeedback(answer.id, "helpful")}
              aria-label="Mark response as helpful"
              disabled={isSubmitting}
            >
              👍{" "}
              {selectedFeedback === "helpful"
                ? language === "hi"
                  ? "चयनित"
                  : language === "mr"
                    ? "निवडले"
                    : "Selected"
                : language === "hi"
                  ? "मददगार"
                  : language === "mr"
                    ? "उपयोगी"
                    : "Helpful"}
            </button>

            <button
              type="button"
              className={`rounded-md border px-2 py-1 transition-colors ${
                selectedFeedback === "not_helpful"
                  ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700"
              }`}
              onClick={() => onFeedback(answer.id, "not_helpful")}
              aria-label="Mark response as not helpful"
              disabled={isSubmitting}
            >
              👎{" "}
              {selectedFeedback === "not_helpful"
                ? language === "hi"
                  ? "चयनित"
                  : language === "mr"
                    ? "निवडले"
                    : "Selected"
                : language === "hi"
                  ? "मददगार नहीं"
                  : language === "mr"
                    ? "उपयोगी नाही"
                    : "Not Helpful"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chatbot({
  language,
  onLanguageChange,
  initialConversationId = null,
}) {
  /*
   * REAL CHAT STATE
   *
   * The chatbot intentionally starts empty.
   * No temporary/demo question or answer is shown.
   */
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceState, setVoiceState] = useState("normal");
  const [feedbackInFlight, setFeedbackInFlight] = useState({});
  const [detectedVoiceLanguage, setDetectedVoiceLanguage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [activeConversationId, setActiveConversationId] = useState(null);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const normalizeForStorage = (chatMessages) => {
    return chatMessages.map((message) => {
      if (message.type === "user") {
        return {
          role: "user",
          content: message.text || "",
          language: message.language || "en",
          timestamp: new Date().toISOString(),
        };
      }

      return {
        role: "assistant",
        content: serializeMessageText(message.answer?.text),
        language: message.answer?.language || "en",
        timestamp: new Date().toISOString(),
        sources: normalizeSources(message.answer?.sources || []),
        feedback: message.answer?.feedback || null,
      };
    });
  };

  const persistConversation = async (nextMessages) => {
    const payload = normalizeForStorage(nextMessages);

    if (!payload.length) {
      return nextMessages;
    }

    try {
      const response = await saveConversation({
        conversationId: activeConversationId,
        messages: payload,
      });

      if (!response?.conversation) {
        throw new Error("Conversation was not returned after save.");
      }

      const savedConversation = response.conversation;

      setActiveConversationId(savedConversation._id || activeConversationId);

      /*
       * MongoDB creates an _id for every stored message.
       * Attach that database ID to the corresponding frontend
       * assistant message so feedback can update the correct
       * MongoDB message later.
       */
      const savedMessages = savedConversation.messages || [];

      const messagesWithDatabaseIds = nextMessages.map((message, index) => {
        const savedMessage = savedMessages[index];

        if (message.type === "assistant" && savedMessage?._id) {
          return {
            ...message,
            answer: {
              ...message.answer,
              mongoMessageId: savedMessage._id,
            },
          };
        }

        return message;
      });

      setMessages(messagesWithDatabaseIds);

      setHistoryError("");

      try {
        const refreshed = await getConversations();
        setConversations(refreshed);
      } catch (error) {
        console.error("Conversation history refresh failed:", error);

        setHistoryError(
          "Conversation saved, but recent history could not be refreshed.",
        );
      }

      return messagesWithDatabaseIds;
    } catch (error) {
      console.error("Conversation save failed:", error);

      setHistoryError("Unable to save your conversation right now.");

      return nextMessages;
    }
  };

  const loadConversationHistory = async () => {
    try {
      const response = await getConversations();

      setConversations(response);
      setHistoryError("");
    } catch (error) {
      console.error("Conversation history load failed:", error);

      setHistoryError("Unable to load recent conversations right now.");
    }
  };

  useEffect(() => {
    loadConversationHistory();
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(
    () => () => {
      mediaRecorderRef.current?.stop();

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const handleFeedback = async (messageId, nextFeedback) => {
    const currentMessage = messages.find(
      (message) =>
        message.type === "assistant" && message.answer?.id === messageId,
    );

    const previousFeedback = currentMessage?.answer?.feedback || null;

    if (
      !messageId ||
      !currentMessage ||
      previousFeedback === nextFeedback ||
      feedbackInFlight[messageId]
    ) {
      return;
    }

    setFeedbackInFlight((current) => ({
      ...current,
      [messageId]: nextFeedback,
    }));

    setMessages((current) =>
      current.map((message) => {
        if (message.type !== "assistant" || message.answer?.id !== messageId) {
          return message;
        }

        return {
          ...message,
          answer: {
            ...message.answer,
            feedback: nextFeedback,
          },
        };
      }),
    );

    try {
      if (!activeConversationId || !currentMessage.answer?.mongoMessageId) {
        throw new Error("Conversation or MongoDB message ID is missing.");
      }

      await submitFeedback(
        activeConversationId,
        currentMessage.answer.mongoMessageId,
        nextFeedback,
      );
    } catch (error) {
      console.error("Feedback submission failed:", error);

      setMessages((current) =>
        current.map((message) => {
          if (
            message.type !== "assistant" ||
            message.answer?.id !== messageId
          ) {
            return message;
          }

          return {
            ...message,
            answer: {
              ...message.answer,
              feedback: previousFeedback,
            },
          };
        }),
      );
    } finally {
      setFeedbackInFlight((current) => {
        const next = { ...current };
        delete next[messageId];
        return next;
      });
    }
  };

  const submit = async (value = input) => {
    const question = value.trim();

    if (!question || loading) {
      return;
    }

    const normalizedLanguage = ["en", "hi", "mr"].includes(language)
      ? language
      : "en";

    const userMessage = {
      type: "user",
      text: question,
      language: normalizedLanguage,
      timestamp: new Date().toISOString(),
    };

    const assistantId = createMessageId("assistant");

    const assistantMessage = {
      type: "assistant",
      answer: {
        id: assistantId,
        text: "",
        language: normalizedLanguage,
        source: "",
        section: "",
        evidence: "",
        sources: [],
        feedback: null,
        timestamp: new Date().toISOString(),
      },
    };

    const nextMessages = [...messages, userMessage, assistantMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    /*
     * HINDI / MARATHI
     *
     * These languages use the normal non-streaming endpoint.
     * English continues to use the streaming endpoint below.
     */
    if (normalizedLanguage !== "en") {
      try {
        const response = await sendMessage(question, normalizedLanguage);

        const answer = response.answer || response.text || "";

        const mergedSources = normalizeSources(response.sources);

        const legacySource =
          response.document || response.source || response.name;

        if (
          !mergedSources.length &&
          (legacySource || response.section || response.evidence)
        ) {
          mergedSources.push({
            document: legacySource || "",
            section: response.section || "",
            evidence: response.evidence || "",
          });
        }

        const completedAssistantMessage = {
          type: "assistant",
          answer: {
            ...assistantMessage.answer,
            text: answer,
            language: response.language || normalizedLanguage,
            source: mergedSources[0]?.document || legacySource || "",
            section: mergedSources[0]?.section || response.section || "",
            evidence: mergedSources[0]?.evidence || response.evidence || "",
            sources: mergedSources,
          },
        };

        const completedMessages = [
          ...messages,
          userMessage,
          completedAssistantMessage,
        ];

        setMessages(completedMessages);

        await persistConversation(completedMessages);
      } catch (error) {
        console.error("Non-streaming chat request failed:", error);

        const fallback = {
          type: "assistant",
          answer: {
            ...assistantMessage.answer,
            text:
              {
                hi: "क्षमा करें, मैं अभी आपके अनुरोध को संसाधित नहीं कर सका। कृपया पुनः प्रयास करें।",
                mr: "क्षमस्व, मी सध्या तुमची विनंती पूर्ण करू शकलो नाही. कृपया पुन्हा प्रयत्न करा.",
              }[normalizedLanguage] ||
              "Sorry, I could not process your request right now. Please try again.",
            language: normalizedLanguage,
            source: "",
            section: "",
            evidence: "",
            sources: [],
          },
        };

        const fallbackMessages = [...messages, userMessage, fallback];

        setMessages(fallbackMessages);

        await persistConversation(fallbackMessages);
      } finally {
        setLoading(false);
      }

      return;
    }

    /*
     * ENGLISH
     *
     * English continues to use the streaming endpoint.
     */
    let streamedAnswer = "";
    let streamedSources = [];

    try {
      await sendMessageStream(question, normalizedLanguage, {
        onSources: (sources) => {
          streamedSources = normalizeSources(sources);

          setMessages((currentMessages) =>
            currentMessages.map((message) => {
              if (
                message.type !== "assistant" ||
                message.answer?.id !== assistantId
              ) {
                return message;
              }

              return {
                ...message,
                answer: {
                  ...message.answer,
                  sources: streamedSources,
                  source: streamedSources[0]?.document || "",
                  section: streamedSources[0]?.section || "",
                  evidence: streamedSources[0]?.evidence || "",
                },
              };
            }),
          );
        },

        onToken: (text) => {
          streamedAnswer += text;

          setMessages((currentMessages) =>
            currentMessages.map((message) => {
              if (
                message.type !== "assistant" ||
                message.answer?.id !== assistantId
              ) {
                return message;
              }

              return {
                ...message,
                answer: {
                  ...message.answer,
                  text: streamedAnswer,
                },
              };
            }),
          );
        },

        onComplete: (response) => {
          const finalAnswer = response.answer || streamedAnswer;

          const finalSources = Array.isArray(response.sources)
            ? normalizeSources(response.sources)
            : streamedSources;

          streamedAnswer = finalAnswer;
          streamedSources = finalSources;

          setMessages((currentMessages) =>
            currentMessages.map((message) => {
              if (
                message.type !== "assistant" ||
                message.answer?.id !== assistantId
              ) {
                return message;
              }

              return {
                ...message,
                answer: {
                  ...message.answer,
                  text: finalAnswer,
                  language: response.language || normalizedLanguage,
                  source: finalSources[0]?.document || "",
                  section: finalSources[0]?.section || "",
                  evidence: finalSources[0]?.evidence || "",
                  sources: finalSources,
                },
              };
            }),
          );
        },
      });

      const finalMessages = [
        ...messages,
        userMessage,
        {
          ...assistantMessage,
          answer: {
            ...assistantMessage.answer,
            text: streamedAnswer,
            language: normalizedLanguage,
            source: streamedSources[0]?.document || "",
            section: streamedSources[0]?.section || "",
            evidence: streamedSources[0]?.evidence || "",
            sources: streamedSources,
          },
        },
      ];

      await persistConversation(finalMessages);
    } catch (error) {
      console.error("Streaming chat request failed:", error);

      const fallback = {
        type: "assistant",
        answer: {
          ...assistantMessage.answer,
          text: "Sorry, I could not process your request right now. Please try again.",
          language: normalizedLanguage,
          source: "",
          section: "",
          evidence: "",
          sources: [],
        },
      };

      const fallbackMessages = [...messages, userMessage, fallback];

      setMessages(fallbackMessages);

      await persistConversation(fallbackMessages);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const conversation = await getConversation(conversationId);

      if (!conversation) {
        return;
      }

      setActiveConversationId(conversationId);

      const loadedMessages = (conversation.messages || []).map((message) => {
        if (message.role === "user") {
          return {
            type: "user",
            text: serializeMessageText(message.content),
            language: message.language || "en",
            timestamp: message.timestamp || null,
          };

        }

        const mergedSources = normalizeSources(message.sources || []);

        return {
          type: "assistant",
          answer: {
            id: createMessageId("assistant"),
            mongoMessageId: message._id || null,
            text: serializeMessageText(message.content),
            language: message.language || "en",
            source: mergedSources[0]?.document || "",
            section: mergedSources[0]?.section || "",
            evidence: mergedSources[0]?.evidence || "",
            sources: mergedSources,
            feedback: message.feedback || null,
            timestamp: message.timestamp || null,
          },
        };
      });

      const detectedLanguage =
        loadedMessages.find((message) => message.type === "user")?.language ||
        loadedMessages.find((message) => message.type === "assistant")?.answer
          ?.language ||
        "en";

      onLanguageChange(detectedLanguage);

      setMessages(loadedMessages);
      setHistoryError("");
    } catch (error) {
      console.error("Conversation load failed:", error);

      setHistoryError(
        "Unable to load that conversation. Please try another one.",
      );
    }
  };

  useEffect(() => {
    if (initialConversationId) {
      loadConversation(initialConversationId);
    }
  }, [initialConversationId]);

  const transcribeRecording = async (audioBlob) => {
    setVoiceState("processing");

    try {
      const selectedLanguage = ["en", "hi", "mr"].includes(language)
        ? language
        : "en";

      const result = await transcribeAudio(audioBlob, selectedLanguage);

      const recognizedText =
        typeof result.text === "string" ? result.text.trim() : "";

      if (!recognizedText) {
        throw new Error("No speech was recognized");
      }

      setInput(recognizedText);

      setDetectedVoiceLanguage(result.language || "");

      setVoiceState("transcribed");

      if (["en", "hi", "mr"].includes(result.language)) {
        onLanguageChange(result.language);
      }
    } catch (error) {
      console.error("Voice transcription failed:", error);

      setVoiceState("error");
    }
  };

  const toggleVoice = async () => {
    if (voiceState === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (voiceState === "processing") {
      return;
    }

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setVoiceState("error");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(mediaStream);

      audioChunksRef.current = [];
      mediaStreamRef.current = mediaStream;
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener(
        "stop",
        () => {
          mediaStream.getTracks().forEach((track) => track.stop());

          mediaStreamRef.current = null;
          mediaRecorderRef.current = null;

          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || "audio/webm",
          });

          audioChunksRef.current = [];

          transcribeRecording(audioBlob);
        },
        { once: true },
      );

      mediaRecorder.start();

      setDetectedVoiceLanguage("");

      setVoiceState("recording");
    } catch (error) {
      console.error("Voice recording failed:", error);

      setVoiceState("error");
    }
  };

  const labels = chatbotLabels[language] || chatbotLabels.en;

  const suggestions = suggestionMap[language] || suggestionMap.en;

  return (
    <div className="relative group">
      <div className="pointer-events-none absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 blur-xl transition-opacity group-hover:opacity-100" />

      <div className="relative flex overflow-hidden rounded-2xl border border-indigo-100/90 bg-white/95 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-indigo-100/70 bg-slate-50 px-4 py-2">
            <button
              type="button"
              className="group/new-chat flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:translate-y-0"
              aria-label={labels.newConversation}
              onClick={() => {
                setMessages([]);
                setInput("");
                setActiveConversationId(null);
                setHistoryError("");
              }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 transition group-hover/new-chat:rotate-90">
                <Icon name="plus" size={14} />
              </span>
              {labels.newConversation}
            </button>

            
          </div>

          <div className="flex items-center justify-between border-b border-indigo-100/70 bg-gradient-to-r from-slate-50/90 via-indigo-50/40 to-slate-50/90 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-md shadow-indigo-500/25">
                <Icon name="robot" size={20} />

                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-[14px] text-slate-900">
                    SupportAI
                  </strong>

                  <span className="text-indigo-300">•</span>

                  <span className="text-[13px] font-medium text-slate-600">
                    {labels.supportAssistant}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                    {labels.ready}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {historyError && (
            <div className="mx-6 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {historyError}
            </div>
          )}

          <div
            className="flex min-h-[380px] max-h-[520px] flex-col gap-6 overflow-y-auto p-6"
            ref={streamRef}
          >
            {messages.length === 0 && !loading && (
              <div className="flex min-h-[280px] items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                    <Icon name="spark" size={24} />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800">
                    How can I help you?
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Ask a question about the information available in the
                    support knowledge base.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) =>
              message.type === "user" ? (
                <UserMessage
                  key={`${message.text}-${index}`}
                  text={message.text}
                  timestamp={message.timestamp}
                  language={language}
                />
              ) : message.answer?.text ? (
                <AssistantMessage
                  key={`${
                    message.answer?.id || message.answer?.text || "assistant"
                  }-${index}`}
                  answer={message.answer}
                  onFeedback={handleFeedback}
                  isSubmitting={Boolean(
                    message.answer?.id && feedbackInFlight[message.answer.id],
                  )}
                  language={language}
                />
              ) : null,
            )}
            {loading && (
              <div className="message-in flex max-w-[92%] items-start gap-3 self-start">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                  <Icon name="robot" size={16} />
                </div>

                <div className="rounded-2xl rounded-tl-sm border border-indigo-100/70 bg-slate-50/90 p-4 text-[14px] text-slate-600 shadow-sm">
                  {messages[messages.length - 1]?.type === "assistant" &&
                  messages[messages.length - 1]?.answer?.text
                    ? null
                    : labels.thinking}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-indigo-100/70 bg-gradient-to-r from-white to-indigo-50/40 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white p-2 shadow-sm">
              <button
                type="button"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                  voiceState === "recording"
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600"
                    : "bg-indigo-50 text-indigo-700 hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md"
                }`}
                aria-label={
                  voiceState === "recording"
                    ? "Stop voice input"
                    : "Voice input"
                }
                onClick={toggleVoice}
                disabled={voiceState === "processing"}
              >
                {voiceState === "recording" && (
                  <span className="absolute inset-0 animate-ping rounded-xl bg-rose-400/40" />
                )}
                <Icon
                  name={voiceState === "recording" ? "recording" : "mic"}
                  size={19}
                  className="relative z-10"
                />
              </button>

              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submit();
                  }
                }}
                placeholder={labels.placeholder}
                className="flex-1 border-0 bg-transparent px-2 py-2 text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
                aria-label="Type your message"
              />

              <button
                type="button"
                onClick={() => submit()}
                disabled={loading}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-500/35 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <Icon name="arrow" size={16} />
              </button>
            </div>

            {voiceState !== "normal" && (
              <p
                className="mt-2 px-1 text-[11px] text-slate-500"
                aria-live="polite"
              >
                {voiceState === "recording" && labels.listening}

                {voiceState === "processing" && labels.transcribing}

                {voiceState === "transcribed" &&
                  `${labels.transcribed}${
                    detectedVoiceLanguage ? ` (${detectedVoiceLanguage})` : ""
                  }`}

                {voiceState === "error" && labels.voiceError}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-full border border-indigo-100 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
                  onClick={() => submit(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RecentConversations
        conversations={conversations}
        onSelectConversation={loadConversation}
        error={historyError}
        language={language}
      />
    </div>
  );
}
