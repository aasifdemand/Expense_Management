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
    useMediaQuery,
    useTheme,
    Switch,
    FormControlLabel
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    MoreVert as MoreVertIcon,
    Menu as MenuIcon,
    Logout as LogoutIcon,
    Settings as SettingsIcon,
    AccountCircle as AccountIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon
} from "@mui/icons-material";


const Navbar = ({
    onMenuClick,
    sidebarOpen,
    darkMode,
    onDarkModeToggle,
    handleLogout
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

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
        // Add profile navigation logic here
        console.log("Profile clicked");
    };

    const handleSettingsClick = () => {
        handleMenuClose();
        // Add settings navigation logic here
        console.log("Settings clicked");
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
                transition: 'all 0.3s ease'
            }}
        >
            <Toolbar>
                {/* Hamburger Menu for mobile */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Logo for mobile */}
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        fontWeight: 'bold',
                        background: "linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)",
                        backgroundClip: "text",
                        textFillColor: "transparent",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}
                >
                    Expense Tracker
                </Typography>

                {/* Right side icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                    {/* Dark Mode Toggle */}
                    <IconButton
                        color="inherit"
                        onClick={onDarkModeToggle}
                        sx={{
                            mr: 1,
                        }}
                    >
                        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    {/* Notifications */}
                    <IconButton
                        size="large"
                        aria-label="show notifications"
                        color="inherit"
                        onClick={handleNotificationClick}
                    >
                        <Badge badgeContent={4} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    {/* Three dots menu */}
                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="show more"
                        aria-controls={menuId}
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                    >
                        <MoreVertIcon />
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
                            minWidth: 300,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }
                    }}
                >
                    <MenuItem onClick={handleNotificationClose}>
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                bgcolor: 'primary.main'
                            }}>
                                <NotificationsIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    New expense submitted
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Just now
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                    <MenuItem onClick={handleNotificationClose}>
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                bgcolor: 'success.main'
                            }}>
                                <NotificationsIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    Payment approved
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    2 hours ago
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                    <MenuItem onClick={handleNotificationClose}>
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                            <Avatar sx={{
                                width: 32,
                                height: 32,
                                mr: 2,
                                bgcolor: 'warning.main'
                            }}>
                                <NotificationsIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
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
                            minWidth: 180,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }
                    }}
                >
                    <MenuItem onClick={handleProfileClick}>
                        <AccountIcon sx={{ mr: 2, fontSize: 20 }} />
                        <Typography variant="body2">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleSettingsClick}>
                        <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
                        <Typography variant="body2">Settings</Typography>
                    </MenuItem>
                    <Box sx={{ px: 2, py: 1 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={darkMode}
                                    onChange={onDarkModeToggle}
                                    size="small"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                                </Typography>
                            }
                        />
                    </Box>
                    {/* <MenuItem onClick={handleLogout}>
                        <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                        <Typography variant="body2">Logout</Typography>
                    </MenuItem> */}
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;