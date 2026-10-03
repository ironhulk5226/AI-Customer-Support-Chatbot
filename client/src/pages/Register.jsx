import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function EyeIcon({ visible }) {
    return visible ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-5 h-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.58 10.58a2 2 0 102.83 2.83"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.88 5.09A10.94 10.94 0 0112 4.5c5.5 0 9.5 7.5 9.5 7.5a17.2 17.2 0 01-3.18 4.15"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.61 6.61C4.45 8.11 2.5 12 2.5 12s4 7.5 9.5 7.5c1.42 0 2.7-.3 3.82-.77"
            />
        </svg>
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-5 h-5"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.5 12s4-7.5 9.5-7.5 9.5 7.5 9.5 7.5-4 7.5-9.5 7.5S2.5 12 2.5 12z"
            />
            <circle cx="12" cy="12" r="2.8" />
        </svg>
    );
}

function SparkIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path d="M12 2.5l1.7 5.8L19.5 10l-5.8 1.7L12 17.5l-1.7-5.8L4.5 10l5.8-1.7L12 2.5z" />
            <path d="M18.5 16.5l.8 2.8 2.7.8-2.7.8-.8 2.8-.8-2.8-2.7-.8 2.7-.8.8-2.8z" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M16 18v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
            <circle cx="10" cy="7" r="3.5" />
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

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordFocused, setPasswordFocused] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        return passwordRegex.test(password);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");

        if (!validatePassword(password)) {
            setError(
                "Please enter a password that follows the required format."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/api/auth/register", {
                name,
                email,
                password
            });

            navigate("/login");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to create account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.25),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.22),_transparent_34%),linear-gradient(135deg,_#eef6ff_0%,_#f8fafc_38%,_#f5f3ff_100%)] px-4 py-10 sm:px-6">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-14 top-10 h-56 w-56 rounded-full bg-blue-300/35 blur-3xl animate-pulse" />
                <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl animate-pulse [animation-delay:1s]" />
                <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-cyan-200/25 blur-3xl animate-pulse [animation-delay:2s]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.28),rgba(255,255,255,0.08))]" />
            </div>

            <div className="relative z-10 w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="mb-5 inline-flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-white/60">
                            <SparkIcon />
                        </div>

                        <span className="text-3xl font-black tracking-tight text-slate-900">
                            Support<span className="text-blue-600">AI</span>
                        </span>
                    </div>

                    <p className="text-[11px] font-bold tracking-[0.26em] text-blue-600 uppercase">
                        Join SupportAI
                    </p>

                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        Create your account
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Get started with your AI support assistant.
                    </p>
                </div>

                {/* Registration Card */}
                <div className="rounded-[28px] border border-white/50 bg-white/30 p-6 shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-20px_rgba(79,70,229,0.24)] sm:p-7">

                    <form
                        onSubmit={handleRegister}
                        className="space-y-5"
                    >

                        {/* Error */}
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm backdrop-blur-sm">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Full name
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <UserIcon />
                                </span>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Email address
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
                                    placeholder="you@example.com"
                                    required
                                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <LockIcon />
                                </span>
                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onFocus={() =>
                                        setPasswordFocused(true)
                                    }
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Create a password"
                                    required
                                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <EyeIcon visible={showPassword} />
                                </button>
                            </div>

                            {/* Password Format - Only shown when password field is active */}
                            {passwordFocused && (
                                <p className="mt-2 text-xs leading-5 text-red-600">
                                    Password should contain at least 8
                                    characters, including 1 uppercase letter,
                                    1 lowercase letter, 1 number, and 1
                                    special character such as @ or $.
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Confirm password
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <LockIcon />
                                </span>
                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm your password"
                                    required
                                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <EyeIcon
                                        visible={showConfirmPassword}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {loading && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            )}
                            <span>{loading ? "Creating account..." : "Create account"}</span>
                        </button>

                    </form>

                    {/* Login Link */}
                    <div className="mt-6 border-t border-white/30 pt-5 text-center">
                        <p className="text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs tracking-[0.16em] text-slate-500 uppercase">
                    AI-powered customer support
                </p>

            </div>
        </div>
    );
}

export default Register;