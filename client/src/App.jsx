import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerHome from "./pages/CustomerHome";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
    return (
        <Routes>
            {/* Customer Login */}
            <Route path="/login" element={<Login />} />

            {/* Customer Registration */}
            <Route path="/register" element={<Register />} />

            {/* Admin Login */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Customer routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/customer" element={<CustomerHome />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Default route */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    );
}

export default App;