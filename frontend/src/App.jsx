import { Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Qr from "./pages/qr"
import AdminDashboard from "./pages/AdminDashboard"
import Expenses from "./pages/Expenses"
import { useAuth } from "./contexts/AuthContext"

const App = () => {
  const { authState } = useAuth();

  const isRedirectToUserDashboard =
    authState?.isAuthenticated &&
    authState?.isTwoFactorVerified &&
    !authState?.isTwoFactorPending &&
    authState?.role === "user"

  const isRedirectToAdminDashboard =
    authState?.isAuthenticated &&
    authState?.isTwoFactorVerified &&
    !authState?.isTwoFactorPending &&
    authState?.role === "superadmin"

  const isRedirectToExpenses =
    authState?.isAuthenticated &&
    authState?.isTwoFactorVerified &&
    !authState?.isTwoFactorPending &&
    authState?.role === "superadmin"

  const isTwoFactorPending = authState?.isTwoFactorPending

  return (
    <Routes>
      {/* User Dashboard Route */}
      <Route
        path="/"
        element={
          isRedirectToUserDashboard ? <Dashboard /> : <Navigate to="/login" />
        }
      />

      {/* Admin Dashboard Route */}
      <Route
        path="/admin-dashboard"
        element={
          isRedirectToAdminDashboard ? <AdminDashboard /> : <Navigate to="/login" />
        }
      />

      {/* Expenses Management Route */}
      <Route
        path="/expenses"
        element={
          isRedirectToExpenses ? <Expenses /> : <Navigate to="/login" />
        }
      />

      {/* Two-Factor Authentication Route */}
      <Route
        path="/qr"
        element={
          isTwoFactorPending ? (
            <Qr />
          ) : authState.isAuthenticated ? (
            authState.role === "superadmin" ? <Navigate to="/admin-dashboard" /> : <Navigate to="/" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Login Route */}
      <Route
        path="/login"
        element={
          authState?.isAuthenticated && !authState?.isTwoFactorPending ? (
            authState.role === "superadmin" ? (
              <Navigate to="/admin-dashboard" />
            ) : (
              <Navigate to="/" />
            )
          ) : (
            <Login />
          )
        }
      />

      {/* Catch-all route - redirect to appropriate dashboard based on role */}
      <Route
        path="*"
        element={
          authState?.isAuthenticated ? (
            authState.role === "superadmin" ? (
              <Navigate to="/admin-dashboard" />
            ) : (
              <Navigate to="/" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  )
}

export default App