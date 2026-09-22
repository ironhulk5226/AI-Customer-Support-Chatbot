import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerHome from "./pages/CustomerHome";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/customer" element={<CustomerHome />} />
            </Route>

            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    );
}

export default App;