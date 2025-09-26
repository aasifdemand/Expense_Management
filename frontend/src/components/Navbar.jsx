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
    FormControl,
    Select,
    useMediaQuery,
    useTheme,
    Switch,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    MoreVert as MoreVertIcon,
    Menu as MenuIcon,
    Settings as SettingsIcon,
    AccountCircle as AccountIcon,
    Business as BusinessIcon,
    Logout as LogoutIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

const Navbar = ({
    onMenuClick,
    onProfileClick,
    onSettingsClick,
    darkMode,
    onDarkModeToggle,
    selectedLocation,
    onLocationChange
}) => {
    const { csrf } = useSelector((state) => state?.auth)
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Locations array
    const locations = [
        { id: "overall", name: "Overall", color: "#28be5dff" },
        { id: "bangalore", name: "Bangalore", color: "#3f51b5" },
        { id: "mumbai", name: "Mumbai", color: "#f44336" },
    ];

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

    const handleLocationChange = (event) => {
        const newLocation = event.target.value;
        if (onLocationChange) {
            onLocationChange(newLocation);
        }
        console.log(`Company location changed to: ${newLocation}`);
    };

    const handleDarkModeToggle = () => {
        if (onDarkModeToggle) {
            onDarkModeToggle();
        }
    };

    // Get current location data
    const getCurrentLocation = () => {
        return locations.find(loc => loc.id === (selectedLocation || "Overall")) || locations[0];
    };

    const currentLocation = getCurrentLocation();

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
                    {/* Company State Dropdown - Only show on desktop */}
                    {!isMobile && (
                        <FormControl
                            size="small"
                            sx={{
                                minWidth: 140,
                                mr: 1
                            }}
                        >
                            <Select
                                value={selectedLocation || "Overall"}
                                onChange={handleLocationChange}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Select company location' }}
                                sx={{
                                    fontSize: '0.875rem',
                                    height: 40,
                                    '& .MuiSelect-select': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        py: 1,
                                    }
                                }}
                                renderValue={(selected) => {
                                    const location = locations.find(loc => loc.id === selected) || locations[0];
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <BusinessIcon
                                                sx={{
                                                    mr: 1,
                                                    fontSize: 18,
                                                    color: location.color
                                                }}
                                            />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    textTransform: 'capitalize',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 'medium'
                                                }}
                                            >
                                                {location.name}
                                            </Typography>
                                        </Box>
                                    );
                                }}
                            >
                                {locations.map((location) => (
                                    <MenuItem key={location.id} value={location.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <BusinessIcon
                                                sx={{
                                                    mr: 1.5,
                                                    fontSize: 18,
                                                    color: location.color
                                                }}
                                            />
                                            <Typography variant="body2">{location.name}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Dark Mode Toggle - Only show on desktop */}
                    {!isMobile && (
                        <IconButton
                            size="medium"
                            aria-label="toggle dark mode"
                            color="inherit"
                            onClick={handleDarkModeToggle}
                            sx={{ p: 1 }}
                        >
                            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    )}

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
                            minWidth: isMobile ? 200 : 220,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }
                    }}
                >
                    {/* Location Selector for Mobile */}
                    {isMobile && (
                        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                Select Location
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedLocation || "bangalore"}
                                    onChange={handleLocationChange}
                                    displayEmpty
                                    sx={{ fontSize: '0.875rem' }}
                                >
                                    {locations.map((location) => (
                                        <MenuItem key={location.id} value={location.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <BusinessIcon
                                                    sx={{
                                                        mr: 1.5,
                                                        fontSize: 18,
                                                        color: location.color
                                                    }}
                                                />
                                                <Typography variant="body2">{location.name}</Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    {/* Current Location Display */}
                    <Box sx={{
                        px: 2,
                        py: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon
                                sx={{
                                    mr: 1.5,
                                    fontSize: 18,
                                    color: currentLocation.color
                                }}
                            />
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Current Location
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {currentLocation.name}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

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

                    {/* Dark Mode Toggle */}
                    <Box sx={{
                        px: 2,
                        py: 1,
                        borderTop: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            {darkMode ? (
                                <LightModeIcon sx={{ mr: 1.5, fontSize: 18, color: 'warning.main' }} />
                            ) : (
                                <DarkModeIcon sx={{ mr: 1.5, fontSize: 18, color: 'primary.main' }} />
                            )}
                            <Typography variant="body2">
                                {darkMode ? 'Light Mode' : 'Dark Mode'}
                            </Typography>
                        </Box>
                        <Switch
                            checked={darkMode}
                            onChange={handleDarkModeToggle}
                            size="small"
                            color="primary"
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