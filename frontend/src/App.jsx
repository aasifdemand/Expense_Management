// import { Navigate, Route, Routes } from "react-router-dom";
// import Login from "./pages/auth/Login";
// import Dashboard from "./pages/user/UserDashboard";
// import Qr from "./pages/auth/qr";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import Expenses from "./pages/admin/Expenses";
// import User from "./pages/admin/User";
// import Report from "./pages/admin/Report";
// import AdminLayout from "./layouts/AdminLayout";
// import Settings from "./pages/admin/Settings";
// import { useSelector } from "react-redux";
// import UserLayout from "./layouts/UserLayout";
// import UserDashboard from "./pages/user/UserDashboard"
// import MyExpenses from "./pages/user/MyExpenses";
// import UserSettings from "./pages/user/UserSettings";


// const App = () => {

//   const { isAuthenticated, isTwoFactorPending, isTwoFactorVerified, role } = useSelector((state) => state?.auth)


//   // console.log("auth logs from redux: ", isAuthenticated, isTwoFactorPending, isTwoFactorVerified, role);



//   const canAccessAdminRoutes =
//     isAuthenticated &&
//     isTwoFactorVerified &&
//     !isTwoFactorPending &&
//     role === "superadmin";

//   const isRedirectToUserDashboard =
//     isAuthenticated &&
//     isTwoFactorVerified &&
//     !isTwoFactorPending &&
//     role === "user";

//   return (

//     <Routes>
//       {/* User Dashboard */}
//       {/* <Route
//         path="/"
//         element={isRedirectToUserDashboard ?
//           <Dashboard /> : <Navigate to={"/login"} />
//         }
//       /> */}

//       <Route path="user" element={<UserLayout />}>
//         <Route path="dashboard" element={
//           isRedirectToUserDashboard ? <UserDashboard /> : <Navigate to="/login" />
//         } />
//         <Route path="expenses" element={
//           isRedirectToUserDashboard ? <MyExpenses /> : <Navigate to="/login" />
//         } />
//         <Route path="settings" element={
//           isRedirectToUserDashboard ? <UserSettings /> : <Navigate to="/login" />
//         } />
//       </Route>


//       <Route path="admin" element={<AdminLayout />}>
//         {/* Admin Dashboard Route */}
//         <Route
//           path="dashboard"
//           element={
//             canAccessAdminRoutes ? <AdminDashboard /> : <Navigate to="/login" />
//           }
//         />

//         {/* Expenses Management */}
//         <Route
//           path="expenses"
//           element={canAccessAdminRoutes ? <Expenses /> : <Navigate to="/login" />}
//         />

//         {/* Users */}
//         <Route
//           path="user"
//           element={canAccessAdminRoutes ? <User /> : <Navigate to="/login" />}
//         />

//         {/* Reports */}
//         <Route
//           path="report"
//           element={canAccessAdminRoutes ? <Report /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="settings"
//           element={canAccessAdminRoutes ? <Settings /> : <Navigate to="/login" />}
//         />
//       </Route>



//       {/* 2FA */}
//       <Route
//         path="/qr"
//         element={
//           isTwoFactorPending ? (
//             <Qr />
//           ) : isAuthenticated ? (
//             role === "superadmin" ? (
//               <Navigate to="/admin/dashboard" />
//             ) : (
//               <Navigate to="/" />
//             )
//           ) : (
//             <Navigate to="/login" />
//           )
//         }
//       />

//       {/* Login */}
//       <Route
//         path="/login"
//         element={
//           isAuthenticated && !isTwoFactorPending ? (
//             role === "superadmin" ? (
//               <Navigate to="/admin/dashboard" />
//             ) : (
//               <Navigate to="/" />
//             )
//           ) : (
//             <Login />
//           )
//         }
//       />

//       {/* Catch-all */}
//       <Route
//         path="*"
//         element={
//           role === "superadmin" ? (
//             <Navigate to="/admin-dashboard" />
//           ) : (
//             <Navigate to="/" />
//           )
//         }
//       />
//     </Routes>

//   );
// };

// export default App;





import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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

const App = () => {
  const { isAuthenticated, isTwoFactorPending, isTwoFactorVerified, role } = useSelector((state) => state?.auth);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('overall');

  // Create theme with useMemo to prevent unnecessary recreations
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: '#3f51b5',
        },
        secondary: {
          main: '#f50057',
        },
        background: {
          default: darkMode ? '#121212' : '#f5f5f5',
          paper: darkMode ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            },
          },
        },
      },
    }),
    [darkMode]
  );

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleLocationChange = (newLocation) => {
    setSelectedLocation(newLocation);
  };


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

  // Props to pass to layouts
  const layoutProps = {
    darkMode,
    onDarkModeToggle: handleDarkModeToggle,
    selectedLocation,
    onLocationChange: handleLocationChange
  };

  // Props to pass to admin dashboard
  const adminDashboardProps = {
    selectedLocation,
    onLocationChange: handleLocationChange
  };

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
        <Route index path="dashboard" element={
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            {/* Root route - redirect based on role */}
            <Route
              path="/"
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
            isRedirectToUserDashboard ? (
            <Navigate to="/user/dashboard" />
            ) : canAccessAdminRoutes ? (
            <Navigate to="/admin/dashboard" />
            ) : (
            <Navigate to="/login" />
            )
          }
        />

            {/* User Routes */}
            <Route
              path="user"
              element={
                isRedirectToUserDashboard ? (
                  <UserLayout {...layoutProps} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="expenses" element={<MyExpenses />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                canAccessAdminRoutes ? (
                  <AdminLayout {...layoutProps} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              {/* Admin Dashboard Route */}
              <Route
                path="dashboard"
                element={<AdminDashboard {...adminDashboardProps} />}
              />

              {/* Expenses Management */}
              <Route
                path="expenses"
                element={<Expenses />}
              />

              {/* Users */}
              <Route
                path="user"
                element={<User />}
              />

              {/* Reports */}
              <Route
                path="report"
                element={<Report />}
              />

              <Route
                path="settings"
                element={<Settings />}
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
                isAuthenticated ? (
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
          </Routes>
        </ThemeProvider>
        );
};

        export default App;












