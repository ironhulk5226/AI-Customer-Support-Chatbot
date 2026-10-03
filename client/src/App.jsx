import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerHome from "./pages/CustomerHome";
import AdminDashboard from "./pages/AdminDashboard";
import ManageDocuments from "./pages/ManageDocuments";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ManageFAQs from "./pages/ManageFAQs";
import ApprovedFAQs from "./pages/ApprovedFAQs";
import ConversationHistory from "./pages/ConversationHistory";

function App() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Customer protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/customer/history" element={<ConversationHistory />} />
      </Route>

      {/* Admin protected routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/documents" element={<ManageDocuments />} />
        <Route path="/admin/faqs" element={<ManageFAQs />} />
        <Route path="/faqs" element={<ManageFAQs />} />
        <Route path="/admin/faqs/approved" element={<ApprovedFAQs />} />
      </Route>

      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
