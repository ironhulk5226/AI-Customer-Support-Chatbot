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
        <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                            <span className="text-lg">✦</span>
                        </div>

                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            SupportAI
                        </span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Create your account
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Get started with your AI support assistant.
                    </p>
                </div>

                {/* Registration Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.03),0_10px_25px_-10px_rgba(15,23,42,0.08)] p-7">

                    <form
                        onSubmit={handleRegister}
                        className="space-y-5"
                    >

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Full name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter your name"
                                required
                                className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="you@example.com"
                                required
                                className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            />
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
                                    className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
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
                                    className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
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
                            className="w-full h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}
                        </button>

                    </form>

                    {/* Login Link */}
                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    AI-powered customer support
                </p>

            </div>
        </div>
    );
}

export default Register;