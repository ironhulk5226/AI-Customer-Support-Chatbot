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

function Login() {
    const navigate = useNavigate();

    const [loginType, setLoginType] = useState("customer");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLoginTypeChange = (type) => {
        setLoginType(type);
        setEmail("");
        setPassword("");
        setError("");
        setShowPassword(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                email,
                password
            });

            const user = response.data.user;

            if (loginType === "admin" && user.role !== "admin") {
                setError("Access denied. Admin account required.");
                return;
            }

            if (loginType === "customer" && user.role !== "customer") {
                setError("Please use the Admin Login option.");
                return;
            }

            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            if (user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/customer");
            }
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
        <div className="min-h-screen bg-[#faf8ff] px-4 py-10">
            <div className="max-w-md mx-auto">

                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                            <span className="text-xl">✦</span>
                        </div>

                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                            Support<span className="text-blue-600">AI</span>
                        </span>
                    </div>

                    <p className="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase">
                        Welcome to SupportAI
                    </p>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        Sign in to your account
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Choose how you want to continue.
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.03),0_10px_25px_-10px_rgba(15,23,42,0.08)] overflow-hidden">

                    {/* Login Type Tabs */}
                    <div className="grid grid-cols-2 border-b border-slate-200">

                        <button
                            type="button"
                            onClick={() =>
                                handleLoginTypeChange("customer")
                            }
                            className={`py-4 text-sm font-semibold transition ${
                                loginType === "customer"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/40"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            👤 Customer Login
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleLoginTypeChange("admin")
                            }
                            className={`py-4 text-sm font-semibold transition ${
                                loginType === "admin"
                                    ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50/40"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            🛡️ Admin Login
                        </button>

                    </div>

                    {/* Form */}
                    <div className="p-7">

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {loginType === "admin"
                                    ? "Admin Login"
                                    : "Customer Login"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {loginType === "admin"
                                    ? "Sign in to access the SupportAI administration panel."
                                    : "Sign in to access your SupportAI account."}
                            </p>
                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >

                            {/* Error */}
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

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
                                    placeholder={
                                        loginType === "admin"
                                            ? "admin@supportai.com"
                                            : "you@example.com"
                                    }
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
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
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
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full h-11 rounded-lg text-white text-sm font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${
                                    loginType === "admin"
                                        ? "bg-violet-600 hover:bg-violet-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {loading
                                    ? "Signing in..."
                                    : loginType === "admin"
                                        ? "Admin Sign in"
                                        : "Customer Sign in"}
                            </button>

                        </form>

                        {/* Customer Registration */}
                        {loginType === "customer" && (
                            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                                <p className="text-sm text-slate-500">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/register"
                                        className="font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Create account
                                    </Link>
                                </p>
                            </div>
                        )}

                        {/* Back to Customer Login */}
                        {loginType === "admin" && (
                            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleLoginTypeChange("customer")
                                    }
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    ← Back to Customer Login
                                </button>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    AI-powered customer support
                </p>

            </div>
        </div>
    );
}

export default Login;