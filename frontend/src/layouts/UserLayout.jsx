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
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Sidebar */}
            <Box
                sx={{
                    display: { xs: "none", md: "block" },
                    flex: isDesktop ? "0 0 300px" : "0 0 auto", // fixed width only on desktop
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

            {/* Sidebar drawer on mobile */}
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

            {/* Main content flexes naturally */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                }}
            >
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
