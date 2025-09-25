import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AdminSidebar from "../components/AdminSidebar";
import Navbar from "../components/Navbar";


export default function AdminLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);


    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
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


            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    ml: { xs: 0, md: "300px" },
                    transition: "margin-left 0.3s ease"
                }}
            >

                <Navbar />


                <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}