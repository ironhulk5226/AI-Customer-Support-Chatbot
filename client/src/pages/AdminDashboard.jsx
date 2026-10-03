import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKnowledgeGaps } from "../services/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(sessionStorage.getItem("user"));

    const [knowledgeGaps, setKnowledgeGaps] = useState([]);
    const [loadingGaps, setLoadingGaps] = useState(true);
    const [gapError, setGapError] = useState("");

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login");
    };

    useEffect(() => {
        const loadKnowledgeGaps = async () => {
            try {
                setLoadingGaps(true);
                setGapError("");

                const gaps = await getKnowledgeGaps();

                setKnowledgeGaps(Array.isArray(gaps) ? gaps : []);
            } catch (error) {
                console.error("Failed to load knowledge gaps:", error);

                setGapError("Failed to load knowledge gaps.");
            } finally {
                setLoadingGaps(false);
            }
        };

        loadKnowledgeGaps();
    }, []);

    return (
        <div className="min-h-screen bg-[#faf8ff] px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">

                    <p className="text-sm font-medium text-blue-600">
                        SupportAI
                    </p>

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                                Admin Dashboard
                            </h1>

                            <p className="mt-2 text-slate-500">
                                Welcome, {user?.name || "Admin"}.
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">

                        <button
                            type="button"
                            onClick={() => navigate("/admin/documents")}
                            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <p className="text-sm text-slate-500">
                                Knowledge Base
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                Manage Documents
                            </p>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/faqs")}
                            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <p className="text-sm text-slate-500">
                                Knowledge Gaps
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                {knowledgeGaps.length}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Detected knowledge gaps
                            </p>
                        </button>

                        <div className="rounded-xl border border-slate-200 p-5">
                            <p className="text-sm text-slate-500">
                                Users
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                Manage Users
                            </p>
                        </div>

                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Knowledge Gaps
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Review unanswered questions detected by the chatbot.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            {loadingGaps && (
                                <div className="rounded-xl border border-slate-200 p-5 text-sm text-slate-500">
                                    Loading knowledge gaps...
                                </div>
                            )}

                            {!loadingGaps && gapError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                                    {gapError}
                                </div>
                            )}

                            {!loadingGaps &&
                                !gapError &&
                                knowledgeGaps.length === 0 && (
                                    <div className="rounded-xl border border-slate-200 p-5 text-sm text-slate-500">
                                        No knowledge gaps have been detected yet.
                                    </div>
                                )}

                            {!loadingGaps &&
                                !gapError &&
                                knowledgeGaps.length > 0 && (
                                    <div className="space-y-4">
                                        {knowledgeGaps.map((gap) => (
                                            <div
                                                key={gap._id || gap.id}
                                                className="rounded-xl border border-slate-200 p-5"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900">
                                                            {gap.originalQuestion}
                                                        </p>

                                                        <p className="mt-2 text-sm text-slate-500">
                                                            Occurrences:{" "}
                                                            {gap.occurrenceCount || 1}
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                        {gap.recurrenceStatus || "emerging"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;