import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConversations } from "../services/api";

function ConversationHistory() {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await getConversations();
                setConversations(Array.isArray(response) ? response : []);
            } catch (loadError) {
                console.error("Conversation history load failed:", loadError);
                setError("Unable to load your conversation history.");
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-indigo-600">SupportAI</p>
                        <h1 className="mt-1 text-3xl font-bold text-slate-900">
                            Conversation history
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Select a conversation to continue where you left off.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/customer")}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Back to chat
                    </button>
                </div>

                {loading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                        Loading conversations...
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                {!loading && !error && conversations.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-indigo-200 bg-white p-8 text-center text-sm text-slate-500">
                        No conversations yet.
                    </div>
                )}

                {!loading && !error && conversations.length > 0 && (
                    <div className="space-y-3">
                        {conversations.map((conversation) => {
                            const title = conversation.title || "Untitled conversation";
                            const preview =
                                conversation.messages?.find(
                                    (message) => message.role === "user",
                                )?.content || "Conversation started";

                            return (
                                <button
                                    key={conversation._id || conversation.id}
                                    type="button"
                                    onClick={() =>
                                        navigate("/customer", {
                                            state: {
                                                conversationId:
                                                    conversation._id ||
                                                    conversation.id,
                                            },
                                        })
                                    }
                                    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
                                >
                                    <span className="min-w-0">
                                        <strong className="block truncate text-sm font-semibold text-slate-900">
                                            {title}
                                        </strong>
                                        <span className="mt-1 block truncate text-sm text-slate-500">
                                            {preview}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-xl text-indigo-500" aria-hidden="true">
                                        →
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConversationHistory;
