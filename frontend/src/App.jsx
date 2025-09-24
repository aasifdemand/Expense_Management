import { Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Qr from "./pages/qr"
import AdminDashboard from "./pages/AdminDashboard"
import Expenses from "./pages/Expenses"
import { useAuth } from "./contexts/AuthContext"

const ProtectedRoute = ({ children, allowedRole }) => {
  const { authState } = useAuth();

  if (!authState?.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (authState.isTwoFactorPending) {
    return <Navigate to="/qr" />;
  }

  if (allowedRole && authState.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  const { authState } = useAuth();

  if (!authState) return <div>Loading...</div>;

  return (
    <Routes>
      {/* User Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRole="user">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Expenses */}
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <Expenses />
          </ProtectedRoute>
        }
      />

      {/* Two-Factor */}
      <Route path="/qr" element={<Qr />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Catch-all */}
      <Route
        path="*"
        element={
          authState.role === "superadmin" ? (
            <Navigate to="/admin-dashboard" />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  )
}

export default App
