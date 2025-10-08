import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import UserSidebar from "../components/UserSidebar";
import Navbar from "../components/Navbar";

export default function UserLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                minHeight: "100vh",
                bgcolor: "background.default",
                width: "100%",
                overflowX: "hidden", // ✅ Prevents sideways scrolling on mobile
            }}
        >
            {/* Sidebar for desktop */}
            <Box
                sx={{
                    display: { xs: "none", md: "block" },
                    flexShrink: 0,
                    width: 280,
                    minWidth: 280,
                }}
            >
                <UserSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    handleLogout={() => { }}
                    loading={loading}
                    setLoading={setLoading}
                    userName="User"
                    userAvatar="U"
                />
            </Box>

            {/* Sidebar drawer for mobile */}
            {!isDesktop && (
                <UserSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    handleLogout={() => { }}
                    loading={loading}
                    setLoading={setLoading}
                    userName="User"
                    userAvatar="U"
                />
            )}

            {/* Main content area */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    overflowX: "hidden",
                }}
            >
                {/* Navbar always visible */}
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content (Outlet) */}
                <Box
                    sx={{
                        flex: 1,
                        p: { xs: 1.5, sm: 2, md: 3 }, // ✅ Adaptive padding
                        width: "100%",
                        overflowY: "auto",
                        overflowX: "hidden",
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
