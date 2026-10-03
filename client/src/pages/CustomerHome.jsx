import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";

function SparkIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M12 2.5l1.7 5.8L19.5 10l-5.8 1.7L12 17.5l-1.7-5.8L4.5 10l5.8-1.7L12 2.5z" />
            <path d="M18.5 16.5l.8 2.8 2.7.8-2.7.8-.8 2.8-.8-2.8-2.7-.8 2.7-.8.8-2.8z" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5s-1.1 6.2-3.2 8.5c-2.1-2.3-3.2-5.1-3.2-8.5S9.9 5.8 12 3.5z" />
        </svg>
    );
}

function LogOutIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M10 5H6.5A1.5 1.5 0 005 6.5v11A1.5 1.5 0 006.5 19H10" />
            <path d="M13 8l4 4-4 4M17 12H9" />
        </svg>
    );
}

function CustomerHome() {
    const navigate = useNavigate();
    const location = useLocation();
    const [language, setLanguage] = useState("en");

    const user = JSON.parse(sessionStorage.getItem("user"));

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.23),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.2),_transparent_35%),linear-gradient(135deg,_#eef6ff_0%,_#f8fafc_42%,_#f5f3ff_100%)] px-4 py-6 sm:px-6 sm:py-8">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl animate-pulse" />
                <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-violet-300/25 blur-3xl animate-pulse [animation-delay:1s]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.22),rgba(255,255,255,0.05))]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="mb-6 flex flex-col gap-5 rounded-[26px] border border-white/60 bg-white/35 p-5 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.2)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:shadow-[0_22px_60px_-20px_rgba(79,70,229,0.2)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 ring-4 ring-white/50">
                            <SparkIcon />
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-wide text-indigo-600">
                                Support<span className="text-violet-600">AI</span>
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                            Welcome, {user?.name || "Customer"}!
                            </h1>

                            <p className="mt-1 text-sm text-slate-600">
                            Ask questions about your account and support services.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-sm">
                            <span className="text-indigo-600"><GlobeIcon /></span>
                            <select
                                value={language}
                                onChange={(event) => setLanguage(event.target.value)}
                                className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                                aria-label="Select language"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिन्दी</option>
                                <option value="mr">मराठी</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-700">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                            Online
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20"
                        >
                            <LogOutIcon />
                            Logout
                        </button>
                    </div>
                </div>

                <Chatbot
                    language={language}
                    onLanguageChange={setLanguage}
                    initialConversationId={location.state?.conversationId || null}
                />
            </div>
        </div>
    );
}

export default CustomerHome;