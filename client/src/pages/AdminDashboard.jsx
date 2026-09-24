import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

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
                        <div className="rounded-xl border border-slate-200 p-5">
                            <p className="text-sm text-slate-500">
                                Knowledge Base
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                Manage Documents
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-5">
                            <p className="text-sm text-slate-500">
                                Knowledge Gaps
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                Review FAQs
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-5">
                            <p className="text-sm text-slate-500">
                                Users
                            </p>

                            <p className="mt-2 text-lg font-semibold text-slate-900">
                                Manage Users
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;