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
      className="h-5 w-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
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
      className="h-5 w-5"
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M12 2.5l1.7 5.8L19.5 10l-5.8 1.7L12 17.5l-1.7-5.8L4.5 10l5.8-1.7L12 2.5z" />
      <path d="M18.5 16.5l.8 2.8 2.7.8-2.7.8-.8 2.8-.8-2.8-2.7-.8 2.7-.8.8-2.8z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M16 18v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1" />
      <circle cx="10" cy="7" r="3.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M12 3.5l7 2.7v5.8c0 4.3-2.7 8.1-7 10.5-4.3-2.4-7-6.2-7-10.5V6.2l7-2.7z" />
      <path d="M9.5 12.2l1.5 1.5 3.5-4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7.8A4 4 0 0112 4a4 4 0 014 3.8V10" />
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
        password,
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

      sessionStorage.setItem("token", response.data.token);

      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.25),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.22),_transparent_34%),linear-gradient(135deg,_#eef6ff_0%,_#f8fafc_38%,_#f5f3ff_100%)] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-14 top-10 h-56 w-56 rounded-full bg-blue-300/35 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-cyan-200/25 blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.28),rgba(255,255,255,0.08))]" />
      </div>

      <div className="relative z-10 mx-auto max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex items-center gap-2 transition-transform duration-300 hover:scale-105">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-xl text-white shadow-lg shadow-indigo-500/30 ring-4 ring-white/60">
              <SparkIcon />
            </div>

            <span className="text-3xl font-black tracking-tight text-slate-900">
              Support<span className="text-blue-600">AI</span>
            </span>
          </div>

          <p className="text-[11px] font-bold tracking-[0.26em] text-blue-600 uppercase">
            Welcome to SupportAI
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Choose how you want to continue.
          </p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-[28px] border border-white/50 bg-white/30 shadow-[0_20px_60px_-18px_rgba(15,23,42,0.18)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-20px_rgba(79,70,229,0.24)]">
          {/* Login Type Tabs */}
          <div className="grid grid-cols-2 border-b border-white/40 bg-white/15">
            <button
              type="button"
              onClick={() => handleLoginTypeChange("customer")}
              className={`relative py-4 text-sm font-semibold transition-all duration-200 ${
                loginType === "customer"
                  ? "border-b-2 border-blue-600 bg-blue-50/60 text-blue-600 shadow-inner"
                  : "text-slate-600 hover:bg-white/20 hover:text-slate-800"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100/80 text-blue-600">
                  <UserIcon />
                </span>
                <span>Customer Login</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleLoginTypeChange("admin")}
              className={`relative py-4 text-sm font-semibold transition-all duration-200 ${
                loginType === "admin"
                  ? "border-b-2 border-violet-600 bg-violet-50/60 text-violet-600 shadow-inner"
                  : "text-slate-600 hover:bg-white/20 hover:text-slate-800"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100/80 text-violet-600">
                  <ShieldIcon />
                </span>
                <span>Admin Login</span>
              </span>
            </button>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {loginType === "admin" ? "Admin Login" : "Customer Login"}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {loginType === "admin"
                  ? "Sign in to access the SupportAI administration panel."
                  : "Sign in to access your SupportAI account."}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm animate-[fadeIn_0.2s_ease-out] backdrop-blur-sm">
                  {error}
                </div>
              )}

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
                    placeholder={
                      loginType === "admin"
                        ? "admin@supportai.com"
                        : "you@example.com"
                    }
                    required
                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Password */}
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/70 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
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
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-75 ${
                  loginType === "admin"
                    ? "bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/20"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                }`}
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                <span>
                  {loading
                    ? "Signing in..."
                    : loginType === "admin"
                      ? "Admin Sign in"
                      : "Customer Sign in"}
                </span>
              </button>
            </form>

            {/* Customer Registration */}
            {loginType === "customer" && (
              <div className="mt-6 border-t border-white/30 pt-5 text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            )}

            {/* Back to Customer Login */}
            {loginType === "admin" && (
              <div className="mt-6 border-t border-white/30 pt-5 text-center">
                <button
                  type="button"
                  onClick={() => handleLoginTypeChange("customer")}
                  className="text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
                >
                  ← Back to Customer Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs tracking-[0.16em] text-slate-500 uppercase">
          AI-powered customer support
        </p>
      </div>
    </div>
  );
}

export default Login;
