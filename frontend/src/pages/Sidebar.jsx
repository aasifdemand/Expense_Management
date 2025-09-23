
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Avatar,
    Divider,
    useTheme,
    useMediaQuery
} from "@mui/material";

import {
    Dashboard as DashboardIcon,
    Receipt as ExpensesIcon,
    AccountBalanceWallet as BudgetIcon,
    People as UsersIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    Analytics as AnalyticsIcon,
    Logout as LogoutIcon,
    Autorenew,

} from "@mui/icons-material";

import { useState } from "react";


const Sidebar = ({
    open,
    onClose,
    darkMode,
    activePage,
    setActivePage,
    handleLogout,
    loading,
    setLoading
}) => {


    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, id: "/dashboard" },
        { text: "Expenses", icon: <ExpensesIcon />, id: "/expenses" },
        //{ text: "Budget", icon: <BudgetIcon />, id: "budget" },
        { text: "Users", icon: <UsersIcon />, id: "users" },
        { text: "Analytics", icon: <AnalyticsIcon />, id: "analytics" },
        { text: "Notifications", icon: <NotificationsIcon />, id: "notifications" },
        { text: "Settings", icon: <SettingsIcon />, id: "settings" }
    ];

    const handleMenuItemClick = (itemId) => {
        setActivePage(itemId);
        if (isMobile) onClose();
    };

    const handleLogoutClick = async () => {
        if (!window.confirm("Are you sure you want to logout?")) return;

        setLoading(true);
        try {
            await handleLogout(); // your API call with context reset
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const SidebarContent = () => (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: 'background.paper', color: 'text.primary', transition: 'all 0.3s ease' }}>
            {/* Header */}
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h5" fontWeight="bold" sx={{
                    background: "linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)",
                    backgroundClip: "text",
                    textFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: 'moveHeader 2s ease-in-out infinite',
                    '@keyframes moveHeader': {
                        '0%': { transform: 'translateX(0px)' },
                        '25%': { transform: 'translateX(2px)' },
                        '50%': { transform: 'translateX(0px)' },
                        '75%': { transform: 'translateX(-2px)' },
                        '100%': { transform: 'translateX(0px)' }
                    }
                }}>
                    Expense Tracker
                </Typography>
                <Typography variant="body2" color="text.secondary">Admin Panel</Typography>
            </Box>

            <Divider />

            {/* User Profile */}
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: "primary.main", fontWeight: "bold" }}>A</Avatar>
                <Box>
                    <Typography variant="body1" fontWeight="bold">Admin User</Typography>
                    <Typography variant="body2" color="text.secondary">Super Admin</Typography>
                </Box>
            </Box>

            <Divider />

            {/* Navigation Menu */}
            <List sx={{ flex: 1, p: 2 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.id}
                        selected={activePage === item.id}
                        onClick={() => handleMenuItemClick(item.id)}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            transition: 'all 0.3s ease',
                            "&.Mui-selected": { bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark", transform: 'scale(1.02)' } },
                            "&:hover": { bgcolor: "primary.dark", color: "white", transform: 'scale(1.02)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                        }}
                    >
                        <ListItemIcon sx={{ color: "inherit", minWidth: 40, transition: 'color 0.3s ease' }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: activePage === item.id ? "bold" : "normal" }} />
                    </ListItem>
                ))}
            </List>

            <Divider />

            {/* Logout Button */}
            <List sx={{ p: 2 }}>
                <ListItem
                    button
                    onClick={handleLogoutClick}
                    sx={{
                        borderRadius: 2,
                        color: "error.main",
                        transition: 'all 0.3s ease',
                        "&:hover": { bgcolor: "error.dark", color: "white", transform: 'scale(1.02)', boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)' },
                        justifyContent: "center",
                    }}
                >

                    <ListItemIcon sx={{ color: "inherit", transition: 'color 0.3s ease' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary={loading ? "logging out..." : "Logout"} />


                </ListItem>
            </List>
        </Box>
    );

    return (
        <>
            <Drawer variant="temporary" open={open} onClose={onClose} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, border: "none", boxShadow: "2px 0 8px rgba(0,0,0,0.1)" } }}>
                <SidebarContent />
            </Drawer>
            <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, border: "none", boxShadow: "2px 0 8px rgba(0,0,0,0.1)", position: "fixed", height: "100vh" } }} open>
                <SidebarContent />
            </Drawer>
        </>
    );
};

export default Sidebar;