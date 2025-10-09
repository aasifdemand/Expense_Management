import { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography,
    IconButton,
    FormHelperText,
    Paper,
    Alert,
    Fade,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";
import {
    Person,
    Visibility,
    VisibilityOff,
    LockOutlined,
    Fingerprint
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthState } from "../../store/authSlice";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.2,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

// Background animation variants
const backgroundVariants = {
    animate: {
        background: [
            "linear-gradient(135deg, #9fcbf4ff 100%, #1094cdff 100%)",
            "linear-gradient(135deg, #1094cdff 0%, #fcfcfcff 0%)",
            "linear-gradient(135deg, #9fcbf4ff 0%, #1094cdff 100%)"

        ],
        transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const floatingShape = {
    animate: {
        y: [0, -20, 0],
        x: [0, 15, 0],
        rotate: [0, 5, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const Login = () => {
    const dispatch = useDispatch()

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [formData, setFormData] = useState({
        name: "",
        password: "",
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
        if (loginError) setLoginError("");
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "Username is required";
        if (!formData.password) tempErrors.password = "Password is required";
        else if (formData.password.length < 6)
            tempErrors.password = "Password must be at least 6 characters";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {

            const deviceName = navigator.userAgent.split(' ')[0];

            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData?.name,
                    password: formData?.password,
                    deviceName
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login response:", data);
                dispatch(setAuthState({
                    isAuthenticated: data.user.authenticated,
                    isTwoFactorPending: data.user.twoFactorPending,
                    isTwoFactorVerified: data.user.twoFactorVerified,
                    role: data.user.role,
                    qr: data.qr,
                }))


                const csrfRes = await fetch(`${import.meta.env.VITE_API_BASEURL}/auth/csrf-token`, {
                    method: "GET",
                    credentials: "include",
                });

                const csrfData = await csrfRes.json();

                if (csrfRes.ok) {
                    localStorage.setItem("csrf", csrfData.csrfToken);
                    // setCsrf(csrfData.csrfToken);
                    dispatch(setAuthState({ csrf: csrfData?.csrfToken }))
                }

                if (data?.user?.twoFactorPending) {
                    navigate("/qr");
                } else if (data.user.role === "superadmin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/user/dashboard");
                }

                //navigate("/qr"); // enable if you want auto redirect
            } else {
                setLoginError(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            setLoginError("Network error. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box
            component={motion.div}
            variants={backgroundVariants}
            animate="animate"
            sx={{
                minHeight: "100vh",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: isMobile ? 1 : 2,
                py: 2,
            }}
        >
            {/* Enhanced Floating Background Shapes */}
            <motion.div
                variants={floatingShape}
                animate="animate"
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: isMobile ? 80 : 100,
                    height: isMobile ? 80 : 100,
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
            />
            <motion.div
                variants={floatingShape}
                animate="animate"
                style={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '10%',
                    width: isMobile ? 100 : 120,
                    height: isMobile ? 100 : 120,
                    background: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
            />
            <motion.div
                variants={floatingShape}
                animate="animate"
                style={{
                    position: 'absolute',
                    top: '60%',
                    left: '5%',
                    width: isMobile ? 60 : 80,
                    height: isMobile ? 60 : 80,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            />
            <motion.div
                variants={floatingShape}
                animate="animate"
                style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '20%',
                    width: isMobile ? 50 : 60,
                    height: isMobile ? 50 : 60,
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            />

            {/* Enhanced Login Form Container */}
            <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: isMobile ? 380 : isTablet ? 400 : 440, position: 'relative', zIndex: 2 }}>
                <Paper
                    elevation={isMobile ? 4 : 12}
                    component={motion.div}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    sx={{
                        bgcolor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(20px)",
                        p: isMobile ? 3.5 : 4,
                        borderRadius: 4,
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        minHeight: isMobile ? "auto" : "480px",
                        height: "auto",
                        justifyContent: "space-between",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        position: "relative",
                        overflow: "hidden",
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #4ca3f5ff, #1094cdff, #4ca3f5ff)',
                            borderRadius: '4px 4px 0 0'
                        }
                    }}
                >
                    {/* Main Content Container */}
                    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        {/* Enhanced Logo and Header */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                mb: 4
                            }}
                            component={motion.div}
                            variants={itemVariants}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 3,
                                    justifyContent: 'center',
                                    padding: 2,
                                    borderRadius: 3,
                                    // background: 'rgba(255, 255, 255, 0.8)',
                                    // boxShadow: '0 8px 20px rgba(76, 163, 245, 0.15)'
                                }}
                            >
                                <img
                                    src="/image.png"
                                    alt="Expense Tracker Logo"
                                    style={{
                                        height: isMobile ? '75px' : '90px',
                                        width: isMobile ? '75px' : '500px',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                fontWeight="700"
                                color="primary.main"
                                textAlign="center"
                                gutterBottom
                                sx={{
                                    fontSize: isMobile ? '1.6rem' : '2rem',
                                    background: "linear-gradient(135deg, #1094cdff 0%, #4ca3f5ff 100%)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                Expense Tracker
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                textAlign="center"
                                sx={{
                                    fontWeight: 500,
                                    fontSize: isMobile ? '0.85rem' : '1rem',
                                    letterSpacing: '0.3px',
                                    mt: 1
                                }}
                            >
                                Manage your expenses efficiently
                            </Typography>
                        </Box>

                        {loginError && (
                            <Fade in={!!loginError}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 3,
                                        alignItems: "center",
                                        py: 1.5,
                                        fontSize: '0.9rem',
                                        background: 'rgba(211, 47, 47, 0.05)',
                                        border: '1px solid rgba(211, 47, 47, 0.2)',
                                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)'
                                    }}
                                    component={motion.div}
                                    variants={itemVariants}
                                >
                                    {loginError}
                                </Alert>
                            </Fade>
                        )}

                        {/* Enhanced Form Fields Container */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                            {/* Enhanced Username Field */}
                            <TextField
                                label="Username"
                                name="name"
                                variant="outlined"
                                size="medium"
                                value={formData.name || ""}
                                onChange={handleChange}
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person color={errors.name ? "error" : "primary"} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 3,
                                        transition: "all 0.3s ease",
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        "&:hover fieldset": {
                                            borderColor: "primary.main",
                                            borderWidth: "2px"
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderWidth: "2.5px",
                                            borderColor: "primary.main",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontFamily: "'Roboto', 'Segoe UI', sans-serif",
                                            fontWeight: 500,
                                            fontSize: isMobile ? '0.95rem' : '1.05rem',
                                            letterSpacing: '0.3px',
                                            py: 1.6
                                        }
                                    },
                                    "& .MuiInputLabel-root": {
                                        fontFamily: "'Inter', 'Arial', sans-serif",
                                        fontWeight: 600,
                                        fontSize: isMobile ? '0.9rem' : '1rem',
                                    },
                                    "& .MuiFormHelperText-root": {
                                        borderRadius: 2,
                                        padding: '4px 8px',
                                        marginTop: '4px',
                                        background: 'rgba(255, 255, 255, 0.8)'
                                    }
                                }}
                                component={motion.div}
                                variants={itemVariants}
                            />

                            {/* Enhanced Password Field */}
                            <FormControl
                                variant="outlined"
                                size="medium"
                                fullWidth
                                error={Boolean(errors.password)}
                                required
                                component={motion.div}
                                variants={itemVariants}
                            >
                                <InputLabel
                                    htmlFor="password"
                                    sx={{
                                        fontFamily: "'Inter', 'Arial', sans-serif",
                                        fontWeight: 600,
                                        fontSize: isMobile ? '0.9rem' : '1rem',
                                    }}
                                >
                                    Password
                                </InputLabel>
                                <OutlinedInput
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <LockOutlined color={errors.password ? "error" : "primary"} />
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="medium"
                                                sx={{
                                                    color: errors.password ? "error.main" : "primary.main",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(76, 163, 245, 0.1)"
                                                    }
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Password"
                                    sx={{
                                        borderRadius: 3,
                                        transition: "all 0.3s ease",
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        "&:hover fieldset": {
                                            borderColor: "primary.main",
                                            borderWidth: "2px"
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderWidth: "2.5px",
                                            borderColor: "primary.main",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontFamily: "'Roboto Mono', 'Courier New', monospace",
                                            fontWeight: 500,
                                            fontSize: isMobile ? '0.95rem' : '1.05rem',
                                            letterSpacing: '1.2px',
                                            py: 1.6
                                        }
                                    }}
                                />
                                {errors.password && (
                                    <FormHelperText
                                        sx={{
                                            mx: 0,
                                            fontSize: "0.8rem",
                                            fontFamily: "'Inter', 'Arial', sans-serif",
                                            borderRadius: 2,
                                            padding: '4px 8px',
                                            marginTop: '4px',
                                            background: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                    >
                                        {errors.password}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Enhanced Submit Button Container */}
                    <Box sx={{ mt: 'auto' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            fullWidth
                            sx={{
                                background: "linear-gradient(135deg, #4ca3f5ff 0%, #1094cdff 100%)",
                                fontWeight: "700",
                                py: 1.8,
                                fontSize: isMobile ? "1rem" : "1.1rem",
                                borderRadius: 3,
                                boxShadow: "0 8px 25px rgba(76, 163, 245, 0.4)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #1094cdff 0%, #4ca3f5ff 100%)",
                                    boxShadow: "0 12px 30px rgba(76, 163, 245, 0.6)",
                                    transform: "translateY(-2px)"
                                },
                                "&:active": {
                                    transform: "translateY(0)"
                                },
                                "&:disabled": {
                                    background: "rgba(76, 163, 245, 0.5)",
                                    boxShadow: "none"
                                },
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 2,
                                fontFamily: "'Inter', 'Arial', sans-serif",
                                minHeight: "54px",
                                textTransform: "none",
                                letterSpacing: "0.5px",
                                transition: "all 0.3s ease",
                                position: "relative",
                                overflow: "hidden",
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                                    transition: 'left 0.5s'
                                },
                                '&:hover::before': {
                                    left: '100%'
                                }
                            }}
                            component={motion.button}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Fingerprint sx={{
                                fontSize: isMobile ? "1.2rem" : "1.4rem",
                                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
                            }} />
                            {isLoading ? "Logging in..." : "Log In"}
                        </Button>
                    </Box>
                </Paper>
            </form>
        </Box>
    );
};

export default Login;