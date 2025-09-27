import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/user/UserDashboard";
import Qr from "./pages/auth/qr";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Expenses from "./pages/admin/Expenses";
import User from "./pages/admin/User";
import Report from "./pages/admin/Report";
import AdminLayout from "./layouts/AdminLayout";
import Settings from "./pages/admin/Settings";
import { useDispatch, useSelector } from "react-redux";
import UserLayout from "./layouts/UserLayout";
import UserDashboard from "./pages/user/UserDashboard"
import MyExpenses from "./pages/user/MyExpenses";
import UserSettings from "./pages/user/UserSettings";
import Budgeting from "./pages/admin/Budgeting";
import { useEffect } from "react";
import { fetchAllUsers, fetchUser } from "./store/authSlice";
import ExpenseUploadForm from "./components/user/ExpenseUploadForm";







const App = () => {

  const dispatch = useDispatch()
  const { isAuthenticated, isTwoFactorPending, isTwoFactorVerified, role, } = useSelector((state) => state?.auth)


  useEffect(() => {
    if (role === "superadmin") {
      dispatch(fetchAllUsers())
    }
  }, [dispatch, role])


  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  // console.log("users ans user: ", user, users);
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

    <Routes>
      {/* User Dashboard */}
      {/* <Route
        path="/"
        element={isRedirectToUserDashboard ?
<Dashboard /> : <Navigate to={"/login"} />
        }
      /> */}

      <Route path="/" element={<UserLayout />}>
        <Route path="dashboard" element={
          isRedirectToUserDashboard ? <UserDashboard /> : <Navigate to="/login" />
        } />
        <Route path="expenses" element={
          isRedirectToUserDashboard ? <MyExpenses /> : <Navigate to="/login" />
        } />
        <Route path="add" element={
          isRedirectToUserDashboard ? <ExpenseUploadForm /> : <Navigate to="/login" />
        } />
        <Route path="settings" element={
          isRedirectToUserDashboard ? <UserSettings /> : <Navigate to="/login" />
        } />
      </Route>


      <Route path="admin" element={<AdminLayout />}>
        {/* Admin Dashboard Route */}
        <Route
          path="dashboard"
          element={
            canAccessAdminRoutes ? <AdminDashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="budget"
          element={
            canAccessAdminRoutes ? <Budgeting /> : <Navigate to="/login" />
          }
        />
        <Route
          path="dashboard"
          element={
            canAccessAdminRoutes ? <AdminDashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="budget"
          element={
            canAccessAdminRoutes ? <Budgeting /> : <Navigate to="/login" />
          }
        />

        {/* Expenses Management */}
        <Route
          path="expenses"
          element={canAccessAdminRoutes ? <Expenses /> : <Navigate to="/login" />}
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
          ) : isAuthenticated ? (
            role === "superadmin" ? (
              <Navigate to="/admin/dashboard" />
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
          isAuthenticated && !isTwoFactorPending ? (
            role === "superadmin" ? (
              <Navigate to="/admin/dashboard" />
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
          role === "superadmin" ? (
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