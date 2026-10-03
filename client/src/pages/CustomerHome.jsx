import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";

function CustomerHome() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState("en");

    const user = JSON.parse(sessionStorage.getItem("user"));

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#faf8ff] px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-indigo-600">
                            SupportAI
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                            Welcome, {user?.name || "Customer"}!
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Ask questions about your account and support services.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={language}
                            onChange={(event) => setLanguage(event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                            aria-label="Select language"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिन्दी</option>
                            <option value="mr">मराठी</option>
                        </select>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <Chatbot
                    language={language}
                    onLanguageChange={setLanguage}
                />
            </div>
        </div>
    );
}

export default CustomerHome;