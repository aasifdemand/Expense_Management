import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Box,
    FormControl,
    Select,
    useMediaQuery,
    useTheme,
    Switch,
} from "@mui/material";
import {
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
import { fetchUser, logout } from "../store/authSlice";
import { useLocation } from "../contexts/LocationContext";

const Navbar = ({
    onMenuClick,
    onProfileClick,
    darkMode,
    onDarkModeToggle,
}) => {
    const { user } = useSelector((state) => state.auth)
    const { csrf } = useSelector((state) => state?.auth)
    const dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { currentLoc, setCurrentLoc } = useLocation()

    // console.log("user in nav: ", user);
    // console.log("currentLoc in nav: ", currentLoc);

    React.useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch])

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleMenuClose();
        if (onProfileClick) onProfileClick();
    };



    const handleLogoutClick = async () => {
        await dispatch(logout(csrf))
    };

    const handleDarkModeToggle = () => {
        if (onDarkModeToggle) onDarkModeToggle();
    };

    // Enhanced locations array
    const locations = [
        { id: "overall", name: "Overall", value: "OVERALL", color: "#28be5dff" },
        { id: "bangalore", name: "Bangalore", value: "BENGALURU", color: "#3f51b5" },
        { id: "mumbai", name: "Mumbai", value: "MUMBAI", color: "#f44336" },
    ];

    // Helper function to get location name
    const getLocationName = (locationValue) => {
        const location = locations.find(loc => loc.value === locationValue);
        return location ? location.name : "Overall";
    };

    // Helper function to get location color
    const getLocationColor = (locationValue) => {
        const location = locations.find(loc => loc.value === locationValue);
        return location ? location.color : "#28be5dff";
    };

    // Handle location change for desktop dropdown
    const handleDesktopLocationChange = (event) => {
        const newLocation = event.target.value;
        console.log('Desktop location change to:', newLocation);
        setCurrentLoc(newLocation);
    };

    // Handle location change for mobile dropdown
    const handleMobileLocationChange = (event) => {
        const newLocation = event.target.value;
        console.log('Mobile location change to:', newLocation);
        setCurrentLoc(newLocation);
    };

    const menuId = 'primary-search-account-menu';

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
                // zIndex: (theme) => theme.zIndex.drawer + 1000
            }}
        >
            <Toolbar sx={{
                minHeight: { xs: 56, sm: 64 },
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                transition: 'all 0.3s ease',
            }}>
                {/* Enhanced Hamburger Menu */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{
                        mr: 2,
                        display: { md: 'none' },
                        p: { xs: 0.5, sm: 1 },
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            transform: 'scale(1.1)',
                        }
                    }}
                >
                    <MenuIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>

                {/* Enhanced App Title */}
                {/* {isMobile && (
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontSize: isSmallMobile ? '1rem' : '1.1rem',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        ExpenseTracker
                    </Typography>
                )} */}

                {/* Enhanced Right side icons */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 },
                    ml: 'auto',
                    transition: 'all 0.3s ease',
                }}>
                    {/* Enhanced Company State Dropdown for Desktop */}
                    {!isMobile && user?.role === "superadmin" && (
                        <FormControl
                            size="small"
                            sx={{
                                minWidth: 140,
                                mr: 1,
                                transition: 'all 0.3s ease',
                                '@media (max-width: 1024px)': {
                                    minWidth: 120,
                                }
                            }}
                        >
                            <Select
                                value={currentLoc || "OVERALL"}
                                onChange={handleDesktopLocationChange}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Select company location' }}
                                sx={{
                                    fontSize: '0.875rem',
                                    height: 40,
                                    transition: 'all 0.3s ease',
                                    '& .MuiSelect-select': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        py: 1,
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    }
                                }}
                                renderValue={(selected) => {
                                    const location = locations.find(loc => loc.value === selected);
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <BusinessIcon
                                                sx={{
                                                    mr: 1,
                                                    fontSize: 18,
                                                    color: location?.color || "#28be5dff"
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
                                                {location?.name || "Overall"}
                                            </Typography>
                                        </Box>
                                    );
                                }}
                            >
                                {locations.map((location) => (
                                    <MenuItem key={location.id} value={location.value}>
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

                    {/* Enhanced Dark Mode Toggle */}
                    {/* {!isMobile && (
                        <IconButton
                            size="medium"
                            aria-label="toggle dark mode"
                            color="inherit"
                            onClick={handleDarkModeToggle}
                            sx={{
                                p: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    transform: 'scale(1.1)',
                                }
                            }}
                        >
                            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    )} */}

                    {/* Enhanced Notifications */}
                    {/* <IconButton
                        size={isMobile ? "small" : "medium"}
                        aria-label="show notifications"
                        color="inherit"
                        onClick={handleNotificationClick}
                        sx={{
                            p: { xs: 0.5, sm: 1 },
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                transform: 'scale(1.1)',
                            }
                        }}
                    >
                        <Badge badgeContent={4} color="error" size={isMobile ? "small" : "medium"}>
                            <NotificationsIcon fontSize={isMobile ? "small" : "medium"} />
                        </Badge>
                    </IconButton> */}

                    {/* Enhanced Three dots menu */}
                    <IconButton
                        size={isMobile ? "small" : "medium"}
                        edge="end"
                        aria-label="show more"
                        aria-controls={menuId}
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                        sx={{
                            p: { xs: 0.5, sm: 1 },
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                transform: 'scale(1.1)',
                            }
                        }}
                    >
                        <MoreVertIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                </Box>

                {/* Enhanced Profile Menu */}
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
                            transition: 'all 0.3s ease',
                            zIndex: (theme) => theme.zIndex.drawer + 2000, // Increased zIndex for dropdown
                            '@media (max-width: 480px)': {
                                minWidth: '95vw',
                                maxWidth: '95vw',
                                mx: 1,
                            }
                        }
                    }}
                >
                    {/* Enhanced Location Selector for Mobile */}
                    {isMobile && user?.role === "superadmin" && (
                        <Box sx={{
                            px: 2,
                            py: 1,
                            borderBottom: 1,
                            borderColor: 'divider',
                            transition: 'all 0.3s ease',
                        }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                Select Location
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={currentLoc || "OVERALL"}
                                    onChange={handleMobileLocationChange}
                                    displayEmpty
                                    sx={{ fontSize: '0.875rem' }}
                                    MenuProps={{
                                        disableScrollLock: true,
                                        sx: {
                                            zIndex: (theme) => theme.zIndex.drawer + 3000, // Highest zIndex for select dropdown
                                        }
                                    }}
                                >
                                    {locations.map((location) => (
                                        <MenuItem
                                            key={location.id}
                                            value={location.value}
                                        >
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

                    {/* Current Location Display for Super Admin */}
                    {user?.role === "superadmin" && (
                        <Box sx={{
                            px: 2,
                            py: 1,
                            borderBottom: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s ease',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BusinessIcon
                                    sx={{
                                        mr: 1.5,
                                        fontSize: 18,
                                        color: getLocationColor(currentLoc)
                                    }}
                                />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Current Location
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {getLocationName(currentLoc)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Profile Menu Items */}
                    <MenuItem onClick={handleProfileClick} sx={{ transition: 'all 0.3s ease' }}>
                        <AccountIcon sx={{
                            mr: 2,
                            fontSize: isMobile ? 18 : 20
                        }} />
                        <Typography variant="body2">Profile</Typography>
                    </MenuItem>


                    {/* Enhanced Dark Mode Toggle */}
                    <Box sx={{
                        px: 2,
                        py: 1,
                        borderTop: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
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

                    <MenuItem onClick={handleLogoutClick} sx={{ transition: 'all 0.3s ease' }}>
                        <LogoutIcon sx={{
                            mr: 2,
                            fontSize: isMobile ? 18 : 20
                        }} />
                        <Typography variant="body2">Logout</Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar >
    );
};

export default Navbar;