
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Qr from "./pages/qr";
import AdminDashboard from "./pages/AdminDashboard";
import Expenses from "./pages/Expenses";
import User from "./pages/User";
import Report from "./pages/Report";
import { useAuth } from "./contexts/AuthContext";
import AdminLayout from "./layouts/AdminLayout";
import Settings from "./pages/Settings";


// import { createTheme, ThemeProvider, useColorScheme } from "@mui/material/styles"
// // import CssBaseline from "@mui/material/CssBaseline"
// import { getDesignTokens } from "./utils/mui-theme";





const App = () => {

  const { authState } = useAuth()



  // 🔑 Auth logic
  const canAccessAdminRoutes =
    authState?.isAuthenticated &&
    authState?.isTwoFactorVerified &&
    !authState?.isTwoFactorPending &&
    authState?.role === "superadmin";

  // const isRedirectToUserDashboard =
  //   authState?.isAuthenticated &&
  //   authState?.isTwoFactorVerified &&
  //   !authState?.isTwoFactorPending &&
  //   authState?.role === "user";

  const isTwoFactorPending = authState?.isTwoFactorPending;

  // const { mode } = useColorScheme()



  // const modeTheme = createTheme(getDesignTokens(mode));

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


      <Route path="admin" element={<AdminLayout />}>
        {/* Admin Dashboard Route */}
        <Route
          path="dashboard"
          element={
            canAccessAdminRoutes ? <AdminDashboard /> : <Navigate to="/login" />
          }
        />

        {/* Expenses Management */}
        <Route
          path="expenses"
          element={canAccessAdminRoutes ? <Expenses /> : <Navigate to="/login" />}
        />

        {/* Users */}
        <Route
          path="user"
          element={canAccessAdminRoutes ? <User /> : <Navigate to="/login" />}
        />

        {/* Reports */}
        <Route
          path="report"
          element={canAccessAdminRoutes ? <Report /> : <Navigate to="/login" />}
        />
        <Route
          path="settings"
          element={canAccessAdminRoutes ? <Settings /> : <Navigate to="/login" />}
        />
      </Route>



      {/* 2FA */}
      <Route
        path="/qr"
        element={
          isTwoFactorPending ? (
            <Qr />
          ) : authState.isAuthenticated ? (
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

      {/* Login */}
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

  );
};

export default App;


















