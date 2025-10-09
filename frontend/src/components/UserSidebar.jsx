import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
    useTheme,
    useMediaQuery,
    Chip,
} from "@mui/material";

import {
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Autorenew,
} from "@mui/icons-material";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PieChartIcon from "@mui/icons-material/PieChart";

const UserSidebar = ({
    open,
    onClose,
}) => {
    const dispatch = useDispatch()
    const { csrf, loading: logoutLoader } = useSelector((state) => state?.auth)
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeItem, setActiveItem] = useState("");
    const [hoveredItem, setHoveredItem] = useState(null);

    // Menu items with their respective icons and paths
    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/user/dashboard" },
        { text: "Budgeting", icon: <PieChartIcon />, path: "/user/budgeting" },
        { text: "Expenses", icon: <AttachMoneyIcon />, path: "/user/expenses" },
        { text: "Settings", icon: <SettingsIcon />, path: "/user/settings" }
    ];

    useEffect(() => {
        setActiveItem(location.pathname);
    }, [location.pathname]);

    const handleMenuItemClick = (path) => {
        navigate(path);
        setActiveItem(path);
        if (isMobile) onClose();
    };

    const handleLogoutClick = async () => {
        await dispatch(logout(csrf))
    };

    // Logo Component - Same as AdminSidebar
    const Logo = () => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: isSmallMobile ? '8px 0' : '16px 0',
            }}
        >
            <Box
                sx={{
                    width: isSmallMobile ? '180px' : isMobile ? '250px' : '320px',
                    height: isSmallMobile ? '80px' : isMobile ? '80px' : '90px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '4px',
                }}
            >
                <img
                    src="/image.png"
                    alt="Company Logo"
                    style={{
                        width: '100%',
                        height: '100%',
                        // objectFit: 'contain',
                    }}
                    onError={(e) => {
                        e.target.src = "/image.svg";
                        e.target.onerror = () => {
                            e.target.src = "/vite.svg";
                            e.target.onerror = () => {
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.logo-fallback');
                                if (fallback) fallback.style.display = 'flex';
                            };
                        };
                    }}
                />
            </Box>
        </Box>
    );

    const SidebarContent = () => (
        <Box sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: '#ffffff',
            color: '#333333',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        }}>
            {/* Header with Full Logo */}
            <Box sx={{
                p: isSmallMobile ? 1.5 : 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: isSmallMobile ? '70px' : '90px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            }}>
                <Logo />
            </Box>

            <Divider sx={{
                my: 1,
                mx: isSmallMobile ? 1 : 2,
                background: 'rgba(0, 0, 0, 0.05)',
            }} />

            {/* Navigation Menu */}
            <List sx={{
                flex: 1,
                px: isSmallMobile ? 1 : 2,
                py: 1
            }}>
                {menuItems.map((item) => {
                    const isActive = activeItem === item.path;
                    const isHovered = hoveredItem === item.path;

                    return (
                        <ListItem
                            key={item.path}
                            onClick={() => handleMenuItemClick(item.path)}
                            onMouseEnter={() => setHoveredItem(item.path)}
                            onMouseLeave={() => setHoveredItem(null)}
                            sx={{
                                borderRadius: 2,
                                mb: 1,
                                mx: isSmallMobile ? 0 : 0.5,
                                px: isSmallMobile ? 1.5 : 2,
                                py: isSmallMobile ? 1 : 1.25,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: isActive
                                    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                    : isHovered
                                        ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                        : 'transparent',
                                border: isActive
                                    ? '1px solid #3b82f6'
                                    : '1px solid transparent',
                                transform: isHovered ? 'translateX(8px) scale(1.02)' : 'translateX(0) scale(1)',
                                boxShadow: isActive
                                    ? '0 4px 15px rgba(59, 130, 246, 0.3)'
                                    : isHovered
                                        ? '0 4px 15px rgba(59, 130, 246, 0.2)'
                                        : 'none',
                                '&::before': isActive ? {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 4,
                                    height: '60%',
                                    background: '#1e40af',
                                    borderRadius: '0 2px 2px 0'
                                } : {},
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.25)',
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive || isHovered ? 'white' : '#6b7280',
                                    minWidth: isSmallMobile ? 32 : 40,
                                    transition: 'all 0.3s ease',
                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: isActive ? 600 : 500,
                                                color: isActive || isHovered ? 'white' : '#374151',
                                                fontSize: isSmallMobile ? '0.8rem' : '0.875rem',
                                                transition: 'all 0.3s ease',
                                                letterSpacing: '0.2px',
                                            }}
                                        >
                                            {item.text}
                                        </Typography>
                                        {item.notification > 0 && (
                                            <Chip
                                                label={item.notification}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    minWidth: 20,
                                                    backgroundColor: isActive || isHovered ? 'rgba(255, 255, 255, 0.2)' : '#ef4444',
                                                    color: isActive || isHovered ? 'white' : 'white',
                                                    '& .MuiChip-label': { px: 0.5 }
                                                }}
                                            />
                                        )}
                                        {item.badge && (
                                            <Chip
                                                label={item.badge}
                                                size="small"
                                                sx={{
                                                    height: 18,
                                                    fontSize: '0.6rem',
                                                    minWidth: 30,
                                                    backgroundColor: isActive || isHovered ? 'rgba(255, 255, 255, 0.2)' : '#3b82f6',
                                                    color: isActive || isHovered ? 'white' : 'white',
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                    );
                })}
            </List>

            {/* Logout Button */}
            <Box sx={{
                p: isSmallMobile ? 1.5 : 2.5,
                pt: 0
            }}>
                <ListItem
                    button
                    onClick={handleLogoutClick}
                    disabled={logoutLoader}
                    onMouseEnter={() => setHoveredItem('logout')}
                    onMouseLeave={() => setHoveredItem(null)}
                    sx={{
                        borderRadius: 2,
                        px: isSmallMobile ? 1.5 : 2,
                        py: isSmallMobile ? 1 : 1.5,
                        background: hoveredItem === 'logout'
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${hoveredItem === 'logout' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)'}`,
                        color: hoveredItem === 'logout' ? 'white' : '#ef4444',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: hoveredItem === 'logout' ? 'translateX(8px) scale(1.02)' : 'translateX(0) scale(1)',
                        boxShadow: hoveredItem === 'logout'
                            ? '0 4px 15px rgba(239, 68, 68, 0.3)'
                            : 'none',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.25)',
                        },
                        '&:disabled': {
                            opacity: 0.6,
                            transform: 'none',
                        }
                    }}
                >
                    <ListItemIcon sx={{
                        color: 'inherit',
                        minWidth: isSmallMobile ? 32 : 40,
                        transition: 'all 0.3s ease',
                        transform: hoveredItem === 'logout' ? 'scale(1.1)' : 'scale(1)'
                    }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={"Logout"}
                        primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: isSmallMobile ? '0.85rem' : '0.95rem',
                            color: 'inherit'
                        }}
                    />
                </ListItem>
            </Box>

            {/* Global Styles for Animations */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Box>
    );

    const drawerWidth = isSmallMobile ? 280 : 320;

    return (
        <>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={open}
                onClose={onClose}
                ModalProps={{
                    keepMounted: true,
                    BackdropProps: {
                        sx: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(8px)'
                        }
                    }
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        border: 'none',
                        boxShadow: '16px 0 40px rgba(0, 0, 0, 0.15)',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                }}
            >
                <SidebarContent />
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 300,
                        border: 'none',
                        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'fixed',
                        height: '100vh',
                        top: 0,
                        left: 0,
                        zIndex: 1200
                    }
                }}
                open
            >
                <SidebarContent />
            </Drawer>
        </>
    );
};

export default UserSidebar;