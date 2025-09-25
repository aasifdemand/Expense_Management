import { useState } from "react";
import Navbar from "../pages/Navbar";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "../pages/Sidebar";

export default function AdminLayout() {
    {/* <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        handleLogout={handleLogout}
        loading={loading}
        setLoading={setLoading}
        userName={currentUser?.displayName || 'Super Admin'}
        userAvatar={currentUser?.displayName?.charAt(0) || 'A'}
      /> */}
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // const handleMenuClick = () => {
    //     setSidebarOpen(!sidebarOpen);
    // };

    // const handleDarkModeToggle = () => {
    //     setDarkMode(!darkMode);
    // };

    const handleLogout = async () => {
        try {
            console.log("logout")
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    return (

        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                handleLogout={handleLogout}
                loading={loading}
                setLoading={setLoading}
                userName="Super Admin"
                userAvatar="A"
            />

            {/* Main content area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    ml: { xs: 0, md: "300px" }, // shifts when sidebar visible on desktop
                    transition: "margin-left 0.3s ease"
                }}
            >
                {/* Navbar */}
                <Navbar />

                {/* Routed pages */}
                <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}