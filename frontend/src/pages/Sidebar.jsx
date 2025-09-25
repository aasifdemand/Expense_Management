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
    useMediaQuery,
    Chip,
} from "@mui/material";

import {
    Dashboard as DashboardIcon,
    Receipt as ExpensesIcon,
    People as UsersIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Autorenew,
    Assessment as ReportsIcon,
} from "@mui/icons-material";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Logo Component
const Logo = ({ size = 44, logoUrl }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                width: isMobile ? 36 : size,
                height: isMobile ? 36 : size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                }
            }}
        >
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt="Expense Tracker Logo"
                    style={{
                        width: '70%',
                        height: '70%',
                        objectFit: 'contain'
                    }}
                />
            ) : (
                <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                        color: 'white',
                        fontSize: isMobile ? '1rem' : '1.25rem'
                    }}
                >
                    ET
                </Typography>
            )}
        </Box>
    );
};

const Sidebar = ({
    open,
    onClose,
    handleLogout,
    loading,
    setLoading,
    logoUrl = null,
    companyName = "ExpenseTracker",
    userName = "Admin User",
    userAvatar = "A",
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeItem, setActiveItem] = useState("");
    const [hoveredItem, setHoveredItem] = useState(null);

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
        { text: "Reimbursement", icon: <ExpensesIcon />, path: "/admin/expenses" },
        { text: "Users", icon: <UsersIcon />, path: "/admin/user" },
        { text: "Reports", icon: <ReportsIcon />, path: "/admin/report" },
        { text: "Settings", icon: <SettingsIcon />, path: "/admin/settings" }
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
        if (!window.confirm("Are you sure you want to logout?")) return;
        setLoading(true);
        try {
            await handleLogout();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const SidebarContent = () => (
        <Box sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            color: theme.palette.text.primary,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease infinite',
            }
        }}>
            {/* Header with Logo and Company Name */}
            <Box sx={{
                p: isSmallMobile ? 2 : 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isSmallMobile ? 1 : 2
                }}>
                    <Logo size={44} logoUrl={logoUrl} />
                    <Box sx={{
                        display: isMobile ? 'none' : 'block',
                        maxWidth: isSmallMobile ? '120px' : 'none'
                    }}>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)'
                                    : 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontSize: isSmallMobile ? '1rem' : '1.25rem',
                                lineHeight: 1.2
                            }}
                        >
                            {companyName}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: isSmallMobile ? '0.6rem' : '0.7rem',
                                display: isSmallMobile ? 'none' : 'block'
                            }}
                        >
                            Expense Management System
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* User Profile Section */}
            <Box sx={{
                p: isSmallMobile ? 1.5 : 2.5,
                mx: isSmallMobile ? 1 : 2,
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #667eea, transparent)'
                }
            }}>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: isSmallMobile ? 1 : 2
                }}>
                    <Avatar sx={{
                        width: isSmallMobile ? 40 : 50,
                        height: isSmallMobile ? 40 : 50,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        fontWeight: "bold",
                        fontSize: isSmallMobile ? '1.1rem' : '1.3rem',
                        boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)'
                    }}>
                        {userAvatar}
                    </Avatar>
                    <Box sx={{
                        flex: 1,
                        minWidth: 0,
                        display: isMobile ? 'none' : 'block'
                    }}>
                        <Typography variant="body1" fontWeight="600" noWrap
                            sx={{ fontSize: isSmallMobile ? '0.9rem' : '1rem' }}>
                            {userName}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: isSmallMobile ? '0.65rem' : '0.75rem'
                            }}
                        >
                            Administrator
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{
                my: isSmallMobile ? 2 : 3,
                mx: isSmallMobile ? 1 : 2,
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)'
            }} />

            {/* Navigation Menu */}
            <List sx={{
                flex: 1,
                px: isSmallMobile ? 0.5 : 1.5,
                py: 1
            }}>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.path}
                        onClick={() => handleMenuItemClick(item.path)}
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                        sx={{
                            borderRadius: 3,
                            mb: 1,
                            mx: isSmallMobile ? 0 : 0.5,
                            px: isSmallMobile ? 1.5 : 2,
                            py: isSmallMobile ? 1 : 1.25,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: activeItem === item.path
                                ? theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                                : 'transparent',
                            border: activeItem === item.path
                                ? `1px solid ${theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`
                                : '1px solid transparent',
                            transform: hoveredItem === item.path ? 'translateX(8px)' : 'translateX(0)',
                            '&::before': activeItem === item.path ? {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 4,
                                height: '60%',
                                background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '0 2px 2px 0'
                            } : {},
                            '&:hover': {
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                                borderColor: theme.palette.mode === 'dark'
                                    ? 'rgba(102, 126, 234, 0.4)'
                                    : 'rgba(102, 126, 234, 0.2)',
                            }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                color: activeItem === item.path ? 'primary.main' : 'text.secondary',
                                minWidth: isSmallMobile ? 32 : 40,
                                transition: 'all 0.3s ease',
                                transform: hoveredItem === item.path ? 'scale(1.1)' : 'scale(1)'
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
                                            fontWeight: activeItem === item.path ? 600 : 400,
                                            color: activeItem === item.path ? 'primary.main' : 'text.primary',
                                            fontSize: isSmallMobile ? '0.8rem' : '0.875rem'
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                    {item.notification > 0 && (
                                        <Chip
                                            label={item.notification}
                                            size="small"
                                            color="error"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                minWidth: 20,
                                                '& .MuiChip-label': { px: 0.5 }
                                            }}
                                        />
                                    )}
                                    {item.badge && (
                                        <Chip
                                            label={item.badge}
                                            size="small"
                                            color="primary"
                                            sx={{
                                                height: 18,
                                                fontSize: '0.6rem',
                                                minWidth: 30
                                            }}
                                        />
                                    )}
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>

            {/* Logout Button */}
            <Box sx={{
                p: isSmallMobile ? 1.5 : 2.5,
                pt: 0
            }}>
                <ListItem
                    button
                    onClick={handleLogoutClick}
                    disabled={loading}
                    onMouseEnter={() => setHoveredItem('logout')}
                    onMouseLeave={() => setHoveredItem(null)}
                    sx={{
                        borderRadius: 3,
                        px: isSmallMobile ? 1.5 : 2,
                        py: isSmallMobile ? 1 : 1.5,
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.2) 100%)'
                            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.1) 100%)',
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                        color: 'error.main',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: hoveredItem === 'logout' ? 'translateX(8px)' : 'translateX(0)',
                        '&:hover': {
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.3) 100%)'
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.2) 100%)',
                            borderColor: theme.palette.mode === 'dark'
                                ? 'rgba(239, 68, 68, 0.5)'
                                : 'rgba(239, 68, 68, 0.3)',
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
                        {loading ? (
                            <Autorenew
                                sx={{
                                    animation: 'spin 1s linear infinite',
                                }}
                            />
                        ) : (
                            <LogoutIcon />
                        )}
                    </ListItemIcon>
                    <ListItemText
                        primary={loading ? "Logging out..." : "Logout"}
                        primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: isSmallMobile ? '0.85rem' : '0.95rem'
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
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
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
                        boxShadow: theme.palette.mode === 'dark'
                            ? '4px 0 20px rgba(0, 0, 0, 0.3)'
                            : '4px 0 20px rgba(0, 0, 0, 0.08)',
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

export default Sidebar;