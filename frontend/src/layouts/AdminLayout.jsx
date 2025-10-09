import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AdminSidebar from "../components/AdminSidebar";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <Box sx={{
            display: "flex",
            minHeight: "100vh",
            bgcolor: "background.default",
            overflow: "hidden"
        }}>
            {/* Sidebar */}
            <AdminSidebar
                open={sidebarOpen}
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
                    width: {
                        xs: sidebarOpen ? "calc(100% - 300px)" : "100%",
                        md: "calc(100% - 300px)"
                    },
                    ml: {
                        xs: sidebarOpen ? "300px" : 0,
                        md: "300px"
                    },
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                <Navbar
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                />

                {/* Content Area with proper scrolling */}
                <Box sx={{
                    flexGrow: 1,
                    p: 3,
                    overflow: "auto",
                    maxHeight: "calc(100vh - 64px)",
                    '&::-webkit-scrollbar': {
                        width: '0px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a8a8a8',
                    }
                }}>
                    <Outlet />
                </Box>
            </Box>

            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 1199,
                        display: { xs: "block", md: "none" }
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </Box>
    );
}