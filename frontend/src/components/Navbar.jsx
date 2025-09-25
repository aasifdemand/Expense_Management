import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Box,
    Avatar,
    Switch,
    FormControlLabel,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    MoreVert as MoreVertIcon,
    Menu as MenuIcon,
    Settings as SettingsIcon,
    AccountCircle as AccountIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Logout as LogoutIcon
} from "@mui/icons-material";

import { useColorScheme } from "@mui/material/styles"
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

const Navbar = ({
    onMenuClick,
    onProfileClick,
    onSettingsClick
}) => {
    const { csrf } = useSelector((state) => state?.auth)
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleProfileClick = () => {
        handleMenuClose();
        if (onProfileClick) {
            onProfileClick();
        } else {
            console.log("Profile clicked");
        }
    };

    const handleSettingsClick = () => {
        handleMenuClose();
        if (onSettingsClick) {
            onSettingsClick();
        } else {
            console.log("Settings clicked");
        }
    };

    const handleLogoutClick = async () => {
        await dispatch(logout(csrf))
    };

    const { mode, setMode } = useColorScheme();

    const handleDarkModeToggle = () => {
        setMode(pre => pre === "dark" ? "light" : "dark")
    };

    const menuId = 'primary-search-account-menu';
    const notificationMenuId = 'notification-menu';

    return (
        <AppBar
            position="sticky"
            elevation={1}
            sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}
        >
            <Toolbar sx={{
                minHeight: { xs: 56, sm: 64 },
                px: { xs: 1, sm: 2 }
            }}>
                {/* Hamburger Menu for mobile */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{
                        mr: 2,
                        display: { md: 'none' },
                        p: { xs: 0.5, sm: 1 }
                    }}
                >
                    <MenuIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>

                {/* App Title for mobile */}
                {isMobile && (
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontSize: '1.1rem',
                            fontWeight: 600
                        }}
                    >
                        ExpenseTracker
                    </Typography>
                )}

                {/* Right side icons */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 },
                    ml: 'auto'
                }}>
                    {/* Dark Mode Toggle */}
                    <IconButton
                        color="inherit"
                        onClick={handleDarkModeToggle}
                        sx={{
                            mr: { xs: 0, sm: 1 },
                            p: { xs: 0.5, sm: 1 }
                        }}
                        aria-label="toggle dark mode"
                    >
                        {mode === "dark" ?
                            <LightModeIcon fontSize={isMobile ? "small" : "medium"} /> :
                            <DarkModeIcon fontSize={isMobile ? "small" : "medium"} />
                        }
                    </IconButton>

                    {/* Notifications */}
                    <IconButton
                        size={isMobile ? "small" : "medium"}
                        aria-label="show notifications"
                        color="inherit"
                        onClick={handleNotificationClick}
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                        <Badge badgeContent={4} color="error" size={isMobile ? "small" : "medium"}>
                            <NotificationsIcon fontSize={isMobile ? "small" : "medium"} />
                        </Badge>
                    </IconButton>

                    {/* Three dots menu */}
                    <IconButton
                        size={isMobile ? "small" : "medium"}
                        edge="end"
                        aria-label="show more"
                        aria-controls={menuId}
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                    >
                        <MoreVertIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                </Box>

                {/* Notification Menu */}
                <Menu
                    disableScrollLock
                    anchorEl={notificationAnchor}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    id={notificationMenuId}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(notificationAnchor)}
                    onClose={handleNotificationClose}
                    PaperProps={{
                        sx: {
                            mt: 4.5,
                            minWidth: isMobile ? 280 : 300,
                            maxWidth: isMobile ? '90vw' : 400,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }
                    }}
                >
                    <MenuItem onClick={handleNotificationClose}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 1,
                            py: 0.5
                        }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                bgcolor: 'primary.main'
                            }}>
                                <NotificationsIcon fontSize="small" />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight="medium" noWrap>
                                    New expense submitted
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Just now
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                    <MenuItem onClick={handleNotificationClose}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 1,
                            py: 0.5
                        }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                bgcolor: 'success.main'
                            }}>
                                <NotificationsIcon fontSize="small" />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight="medium" noWrap>
                                    Payment approved
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    2 hours ago
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                    <MenuItem onClick={handleNotificationClose}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 1,
                            py: 0.5
                        }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                bgcolor: 'warning.main'
                            }}>
                                <NotificationsIcon fontSize="small" />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight="medium" noWrap>
                                    Budget limit warning
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    1 day ago
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                </Menu>

                {/* Profile Menu */}
                <Menu
                    disableScrollLock
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    id={menuId}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            mt: 4.5,
                            minWidth: isMobile ? 160 : 180,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }
                    }}
                >
                    <MenuItem onClick={handleProfileClick}>
                        <AccountIcon sx={{
                            mr: 2,
                            fontSize: isMobile ? 18 : 20
                        }} />
                        <Typography variant="body2">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleSettingsClick}>
                        <SettingsIcon sx={{
                            mr: 2,
                            fontSize: isMobile ? 18 : 20
                        }} />
                        <Typography variant="body2">Settings</Typography>
                    </MenuItem>
                    <Box sx={{
                        px: 2,
                        py: 1,
                        borderTop: 1,
                        borderBottom: 1,
                        borderColor: 'divider'
                    }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={mode === "dark"}
                                    onChange={handleDarkModeToggle}
                                    size="small"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    {mode === "dark" ? 'Light Mode' : 'Dark Mode'}
                                </Typography>
                            }
                        />
                    </Box>
                    <MenuItem onClick={handleLogoutClick}>
                        <LogoutIcon sx={{
                            mr: 2,
                            fontSize: isMobile ? 18 : 20
                        }} />
                        <Typography variant="body2">Logout</Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;