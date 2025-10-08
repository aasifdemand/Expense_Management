import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import AdminSidebar from "../components/AdminSidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isDesktop = useMediaQuery("(min-width:900px)");

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                bgcolor: "background.default",
                overflow: "hidden",
            }}
        >
            {/* Sidebar */}
            <AdminSidebar
                open={isDesktop ? true : sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                handleLogout={() => { }}
                loading={loading}
                setLoading={setLoading}
                userName="Super Admin"
                userAvatar="A"
            />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    transition: "margin 0.3s ease, width 0.3s ease",
                    ml: isDesktop ? "300px" : 0,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Navbar
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                />

                {/* Scrollable Content Area */}
                <Box
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3 },
                        overflowY: "auto",
                        maxHeight: "calc(100vh - 64px)",
                        "&::-webkit-scrollbar": {
                            width: "0px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "#c1c1c1",
                            borderRadius: "4px",
                        },
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            {/* Mobile Overlay */}
            {!isDesktop && sidebarOpen && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 1199,
                        display: "block",
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </Box>
    );
}
