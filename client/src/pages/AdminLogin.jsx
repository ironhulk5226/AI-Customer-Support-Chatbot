import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function SparkIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M12 2.5l1.7 5.8L19.5 10l-5.8 1.7L12 17.5l-1.7-5.8L4.5 10l5.8-1.7L12 2.5z" />
            <path d="M18.5 16.5l.8 2.8 2.7.8-2.7.8-.8 2.8-.8-2.8-2.7-.8 2.7-.8.8-2.8z" />
        </svg>
    );
}

function MailIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M4 7l8 6 8-6" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7.8A4 4 0 0112 4a4 4 0 014 3.8V10" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M12 3.5l7 2.7v5.8c0 4.3-2.7 8.1-7 10.5-4.3-2.4-7-6.2-7-10.5V6.2l7-2.7z" />
            <path d="M9.5 12.2l1.5 1.5 3.5-4" />
        </svg>
    );
}

function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                email,
                password
            });

            if (response.data.user.role !== "admin") {
                setError("Access denied. Admin account required.");
                return;
            }

            sessionStorage.setItem("token", response.data.token);
            sessionStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/admin");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.26),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.24),_transparent_34%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_38%,_#faf5ff_100%)] px-4 py-10 sm:px-6">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-14 top-10 h-56 w-56 rounded-full bg-indigo-300/35 blur-3xl animate-pulse" />
                <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl animate-pulse [animation-delay:1s]" />
                <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-fuchsia-200/25 blur-3xl animate-pulse [animation-delay:2s]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.28),rgba(255,255,255,0.08))]" />
            </div>

            <div className="relative z-10 w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="mb-5 inline-flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 ring-4 ring-white/60">
                            <SparkIcon />
                        </div>

                        <span className="text-3xl font-black tracking-tight text-slate-900">
                            Support<span className="text-violet-600">AI</span>
                        </span>
                    </div>

                    <p className="text-[11px] font-bold tracking-[0.26em] text-violet-600 uppercase">
                        Secure workspace
                    </p>

                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        Admin Login
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Sign in to access the SupportAI administration panel.
                    </p>
                </div>

                <div className="rounded-[28px] border border-white/50 bg-white/30 p-6 shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-20px_rgba(124,58,237,0.24)] sm:p-7">
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-violet-200/60 bg-violet-50/60 px-4 py-3 text-violet-700 backdrop-blur-sm">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                            <ShieldIcon />
                        </span>
                        <p className="text-xs leading-5">
                            Authorized administrators only. Your workspace is protected.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm backdrop-blur-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Admin email
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <MailIcon />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@supportai.com"
                                    required
                                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <LockIcon />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    required
                                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/20 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {loading && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            )}
                            <span>{loading ? "Signing in..." : "Admin Sign in"}</span>
                        </button>
                    </form>

                    <div className="mt-6 border-t border-white/30 pt-5 text-center">
                        <p className="text-sm text-slate-600">
                            Are you a customer?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-violet-600 transition-colors duration-200 hover:text-violet-700"
                            >
                                Customer Login
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs tracking-[0.16em] text-slate-500 uppercase">
                    SupportAI Administration
                </p>
            </div>
        </div>
    );
}

export default AdminLogin;