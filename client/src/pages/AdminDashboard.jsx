import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminAnalytics, getKnowledgeGaps } from "../services/api";

function SparkIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M12 2.5l1.7 5.8L19.5 10l-5.8 1.7L12 17.5l-1.7-5.8L4.5 10l5.8-1.7L12 2.5z" />
            <path d="M18.5 16.5l.8 2.8 2.7.8-.2.1-2.5.7-.8 2.8-.8-2.8-2.7-.8 2.7-.8.8-2.8z" />
        </svg>
    );
}

function DashboardIcon({ type }) {
    const paths = {
        document: <><path d="M6 3h8l4 4v14H6a2 2 0 01-2-2V5a2 2 0 012-2Z" /><path d="M14 3v5h5M8 13h8M8 17h6" /></>,
        gaps: <><path d="M12 3l9 16H3L12 3Z" /><path d="M12 9v4M12 16h.01" /></>,
        analytics: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /><path d="M18 6h-3M18 6v3" /></>,
    };
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">{paths[type]}</svg>;
}

const emptyAnalytics = {
    generatedAt: null,
    totals: {
        users: 0,
        conversations: 0,
        messages: 0,
        activeToday: 0,
        documents: 0,
        faqs: 0,
        candidateGaps: 0,
        totalKnowledgeGaps: 0,
        approvedFaqs: 0,
    },
    languages: [],
    daily: [],
    documents: [],
    faqs: [],
    feedback: { helpful: 0, not_helpful: 0 },
};

const numberFormatter = new Intl.NumberFormat("en-IN");

function formatNumber(value) {
    return numberFormatter.format(value || 0);
}

function getSatisfactionDetails(feedback) {
    const helpful = feedback?.helpful || 0;
    const notHelpful = feedback?.not_helpful || 0;
    const total = helpful + notHelpful;
    const score = total ? Math.round((helpful / total) * 100) : 0;

    if (!total) {
        return {
            score,
            label: "Awaiting feedback",
            description: "Customer ratings will appear here as users review responses.",
            tone: "text-slate-600",
            ring: "#94a3b8",
            remainder: "#e2e8f0",
        };
    }

    if (score >= 80) {
        return {
            score,
            label: "Excellent experience",
            description: "Most customers found the chatbot responses helpful.",
            tone: "text-emerald-700",
            ring: "#10b981",
            remainder: "#fecdd3",
        };
    }

    if (score >= 60) {
        return {
            score,
            label: "Good experience",
            description: "Customers are generally satisfied, with room to improve.",
            tone: "text-amber-700",
            ring: "#f59e0b",
            remainder: "#fed7aa",
        };
    }

    return {
        score,
        label: "Needs attention",
        description: "Review negative ratings to improve the support experience.",
        tone: "text-rose-700",
        ring: "#f43f5e",
        remainder: "#fecdd3",
    };
}

function AnalyticsMetric({ label, value, accent }) {
    return (
        <div className="rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-black ${accent}`}>{formatNumber(value)}</p>
        </div>
    );
}

function BarChart({ daily }) {
    const values = daily.map((item) => item.messages || 0);
    const maximum = Math.max(...values, 1);

    return (
        <div className="flex h-44 items-end gap-2 sm:gap-3">
            {daily.length === 0 ? (
                <p className="self-center text-sm text-slate-500">No message activity recorded yet.</p>
            ) : daily.map((item) => {
                const height = Math.max(((item.messages || 0) / maximum) * 100, 5);
                const date = new Date(`${item._id}T00:00:00`);

                return (
                    <div key={item._id} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                        <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                            {item.messages || 0}
                        </span>
                        <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-400 transition-all duration-500 group-hover:from-violet-600 group-hover:to-fuchsia-400"
                            style={{ height: `${height}%` }}
                            title={`${item.messages || 0} messages`}
                        />
                        <span className="text-[10px] font-medium text-slate-500">
                            {date.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function StatusRows({ items, colors }) {
    const total = items.reduce((sum, item) => sum + (item.count || 0), 0) || 1;

    return (
        <div className="space-y-3">
            {items.length === 0 ? (
                <p className="text-sm text-slate-500">No records available yet.</p>
            ) : items.map((item, index) => (
                <div key={item._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span className="capitalize">{String(item._id).replace("_", " ")}</span>
                        <span>{formatNumber(item.count)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${(item.count / total) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(sessionStorage.getItem("user"));

    const [knowledgeGaps, setKnowledgeGaps] = useState([]);
    const [loadingGaps, setLoadingGaps] = useState(true);
    const [gapError, setGapError] = useState("");
    const [analytics, setAnalytics] = useState(emptyAnalytics);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState("");
    const satisfaction = getSatisfactionDetails(analytics.feedback);

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

                const gaps = await getKnowledgeGaps("candidate");

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

    useEffect(() => {
        let active = true;

        const loadAnalytics = async () => {
            try {
                setAnalyticsLoading(true);
                setAnalyticsError("");
                const data = await getAdminAnalytics();

                if (active) {
                    setAnalytics({ ...emptyAnalytics, ...data, totals: { ...emptyAnalytics.totals, ...data.totals } });
                }
            } catch (error) {
                console.error("Failed to load admin analytics:", error);
                if (active) setAnalyticsError("Analytics are temporarily unavailable.");
            } finally {
                if (active) setAnalyticsLoading(false);
            }
        };

        loadAnalytics();
        const intervalId = window.setInterval(loadAnalytics, 30000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.25),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.2),_transparent_35%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_42%,_#faf5ff_100%)] px-4 py-6 sm:px-6 sm:py-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl animate-pulse" />
                <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-300/25 blur-3xl animate-pulse [animation-delay:1s]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.24),rgba(255,255,255,0.06))]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="rounded-[28px] border border-white/60 bg-white/35 p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)] backdrop-blur-2xl backdrop-saturate-150 sm:p-8">

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 ring-4 ring-white/50">
                            <SparkIcon />
                        </div>
                        <p className="text-lg font-black tracking-tight text-slate-900">
                            Support<span className="text-violet-600">AI</span>
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-violet-600">
                                Administration workspace
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                Admin Dashboard
                            </h1>

                            <p className="mt-2 text-slate-600">
                                Welcome, {user?.name || "Admin"}.
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">

                        <button
                            type="button"
                            onClick={() => navigate("/admin/documents")}
                            className="group rounded-2xl border border-white/70 bg-white/55 p-5 text-left shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/80 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition group-hover:scale-105">
                                <DashboardIcon type="document" />
                            </span>
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
                            className="group rounded-2xl border border-white/70 bg-white/55 p-5 text-left shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:bg-violet-50/80 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                        >
                            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:scale-105">
                                <DashboardIcon type="gaps" />
                            </span>
                            <p className="text-sm text-slate-500">
                                Knowledge Gaps
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                Review Knowledge Gaps
                            </p>

                            <p className="mt-3 text-4xl font-black leading-none tracking-tight text-violet-700">
                                {knowledgeGaps.length}
                            </p>

                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                detected knowledge gap
                                {knowledgeGaps.length === 1 ? "" : "s"}
                            </p>
                        </button>

                    </div>

                    <section className="mt-8 rounded-3xl border border-white/70 bg-white/35 p-5 shadow-sm backdrop-blur-xl sm:p-6">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                        <DashboardIcon type="analytics" />
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900">Live support analytics</h2>
                                </div>
                                <p className="mt-2 text-sm text-slate-500">
                                    A real-time view of customer activity and knowledge-base health.
                                </p>
                            </div>
                            <span className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:self-auto">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                Updates every 30 seconds
                            </span>
                        </div>

                        {analyticsError && (
                            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{analyticsError}</p>
                        )}

                        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <AnalyticsMetric label="Customers" value={analytics.totals.users} accent="text-indigo-700" />
                            <AnalyticsMetric label="Conversations" value={analytics.totals.conversations} accent="text-violet-700" />
                            <AnalyticsMetric label="Messages" value={analytics.totals.messages} accent="text-fuchsia-700" />
                            <AnalyticsMetric label="Active today" value={analytics.totals.activeToday} accent="text-emerald-700" />
                        </div>

                        <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                            <div className="rounded-2xl border border-white/70 bg-white/55 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Message activity</h3>
                                        <p className="text-xs text-slate-500">Last 7 days</p>
                                    </div>
                                    {analyticsLoading && <span className="text-xs font-medium text-indigo-500">Refreshing...</span>}
                                </div>
                                <BarChart daily={analytics.daily} />
                            </div>

                            <div className="rounded-2xl border border-white/70 bg-white/55 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Overall customer satisfaction</h3>
                                        <p className="mt-1 text-xs text-slate-500">How customers feel about chatbot support</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                        Live score
                                    </span>
                                </div>
                                <div className="mt-5 flex items-center gap-5">
                                    <div
                                        className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full p-1 shadow-lg shadow-emerald-500/10"
                                        style={{
                                            background: `conic-gradient(${satisfaction.ring} ${satisfaction.score}%, ${satisfaction.remainder} 0)`,
                                        }}
                                    >
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-white/95 text-center">
                                            <div>
                                                <p className={`text-2xl font-black leading-none ${satisfaction.tone}`}>{satisfaction.score}%</p>
                                                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">satisfaction</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-0 space-y-3 text-sm">
                                        <div>
                                            <p className={`font-bold ${satisfaction.tone}`}>{satisfaction.label}</p>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-500">{satisfaction.description}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
                                            <p><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />Helpful <strong>{formatNumber(analytics.feedback.helpful)}</strong></p>
                                            <p><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-rose-300" />Needs work <strong>{formatNumber(analytics.feedback.not_helpful)}</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-5 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/70 bg-white/55 p-4">
                                <h3 className="mb-4 font-semibold text-slate-900">Knowledge base</h3>
                                <StatusRows items={analytics.documents} colors={["bg-blue-500", "bg-amber-400", "bg-rose-400", "bg-emerald-500"]} />
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/55 p-4">
                                <h3 className="font-semibold text-slate-900">Approved FAQs</h3>
                                <p className="mt-4 text-5xl font-black leading-none tracking-tight text-violet-700">
                                    {formatNumber(analytics.totals.approvedFaqs)}
                                </p>
                                <p className="mt-3 text-sm font-semibold text-slate-500">
                                    FAQs approved and available in the knowledge base
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/55 p-4">
                                <h3 className="mb-4 font-semibold text-slate-900">Languages used</h3>
                                <StatusRows items={analytics.languages.map((item) => ({ ...item, count: item.messages }))} colors={["bg-indigo-500", "bg-fuchsia-500", "bg-cyan-500"]} />
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;