import { useNavigate } from "react-router-dom";

function CustomerHome() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#faf8ff] px-6 py-10">
            <div className="max-w-4xl mx-auto">

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-blue-600">
                                SupportAI
                            </p>

                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                                Welcome, {user?.name || "Customer"}!
                            </h1>

                            <p className="mt-2 text-slate-500">
                                You are successfully authenticated.
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
                        <p className="text-sm font-medium text-slate-700">
                            Authentication test page
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            The main customer chatbot interface will be connected here later.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CustomerHome;