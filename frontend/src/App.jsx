import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Qr from "./pages/auth/qr";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Expenses from "./pages/admin/Expenses";
import User from "./pages/admin/User";
import Report from "./pages/admin/Report";
import AdminLayout from "./layouts/AdminLayout";
import Settings from "./pages/admin/Settings";
import { useDispatch, useSelector } from "react-redux";
import UserLayout from "./layouts/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import MyExpenses from "./pages/user/MyExpenses";
import Budgeting from "./pages/admin/Budgeting";
import { useEffect } from "react";
import { fetchAllUsers, fetchUser, logout } from "./store/authSlice";
import ExpenseUploadForm from "./components/user/ExpenseUploadForm";
import Budgetings from "./pages/user/Budgetings";
import Reimbursements from "./pages/admin/Reimbursements";
import { SocketProvider } from "../src/contexts/SocketContext";
import { Toaster, toast } from "react-hot-toast";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isAuthenticated,
    isTwoFactorPending,
    isTwoFactorVerified,
    role,
  } = useSelector((state) => state?.auth);

  // Fetch session on mount
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  // Fetch all users for admin
  useEffect(() => {
    if (
      role === "superadmin" &&
      isAuthenticated &&
      !isTwoFactorPending &&
      isTwoFactorVerified
    ) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, role, isAuthenticated, isTwoFactorPending, isTwoFactorVerified]);



  const canAccessAdminRoutes =
    isAuthenticated &&
    isTwoFactorVerified &&
    !isTwoFactorPending &&
    role === "superadmin";

  const isRedirectToUserDashboard =
    isAuthenticated &&
    isTwoFactorVerified &&
    !isTwoFactorPending &&
    role === "user";

  return (
    <SocketProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="user" element={<UserLayout />}>
          <Route
            path="dashboard"
            element={
              isRedirectToUserDashboard ? (
                <UserDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="expenses"
            element={
              isRedirectToUserDashboard ? (
                <MyExpenses />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="budgeting"
            element={
              isRedirectToUserDashboard ? (
                <Budgetings />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="add"
            element={
              isRedirectToUserDashboard ? (
                <ExpenseUploadForm />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="settings"
            element={
              isRedirectToUserDashboard ? (
                <Settings />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={
              canAccessAdminRoutes ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="budget"
            element={
              canAccessAdminRoutes ? <Budgeting /> : <Navigate to="/login" />
            }
          />
          <Route
            path="expenses"
            element={
              canAccessAdminRoutes ? <Expenses /> : <Navigate to="/login" />
            }
          />
          <Route
            path="reimbursements"
            element={
              canAccessAdminRoutes ? (
                <Reimbursements />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="user"
            element={canAccessAdminRoutes ? <User /> : <Navigate to="/login" />}
          />
          <Route
            path="report"
            element={
              canAccessAdminRoutes ? <Report /> : <Navigate to="/login" />
            }
          />
          <Route
            path="settings"
            element={
              canAccessAdminRoutes ? <Settings /> : <Navigate to="/login" />
            }
          />
        </Route>

        {/* 2FA */}
        <Route
          path="/qr"
          element={
            isTwoFactorPending ? (
              <Qr />
            ) : isAuthenticated ? (
              role === "superadmin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/user/dashboard" />
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
            isAuthenticated && !isTwoFactorPending ? (
              role === "superadmin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/user/dashboard" />
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
            role === "superadmin" ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Navigate to="/user/dashboard" />
            )
          }
        />
      </Routes>
    </SocketProvider>
  );
};

export default App;
