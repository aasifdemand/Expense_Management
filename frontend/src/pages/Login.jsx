import React, { useState } from "react";
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
    TrendingUp
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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

const Login = () => {
    const { setAuthState, setCsrf } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            const response = await fetch(`http://localhost:5000/api/v1/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData?.name,
                    password: formData?.password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login response:", data);

                setAuthState({
                    isAuthenticated: data.session.authenticated,
                    isTwoFactorPending: data.session.twoFactorPending,
                    isTwoFactorVerified: data.session.twoFactorVerified,
                    role: data.session.role,
                    userId: data.session.userId,
                    qr: data.qr,
                });


                const csrfRes = await fetch("http://localhost:5000/api/v1/auth/csrf-token", {
                    credentials: "include",
                });

                const csrfData = await csrfRes.json();

                if (csrfRes.ok) {
                    localStorage.setItem("csrf", csrfData.csrfToken);
                    setCsrf(csrfData.csrfToken);
                }

                if (data?.session?.twoFactorPending) {
                    navigate("/qr");
                } else if (data.session.role === "superadmin") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/");
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
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #1868b7ff 0%, #5fdc87ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: isMobile ? 1 : 2,
                py: 2,
            }}
        >
            <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 450 }}>
                <Paper
                    elevation={isMobile ? 2 : 8}
                    component={motion.div}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    sx={{
                        bgcolor: "white",
                        p: isMobile ? 3 : 4,
                        borderRadius: 3,
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                    }}
                >
                    {/* Logo and Header */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            mb: 2
                        }}
                        component={motion.div}
                        variants={itemVariants}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                                justifyContent: 'center'
                            }}
                        >
                            <img
                                src="/image.png"
                                alt="Expense Tracker Logo"
                                style={{
                                    height: isMobile ? '80px' : '100px',
                                    width: isMobile ? '80px' : '250px',
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            fontWeight="600"
                            color="primary.main"
                            textAlign="center"
                            gutterBottom
                        >
                            Expense Tracker
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ fontWeight: 500 }}
                        >
                            Manage your expenses efficiently
                        </Typography>
                    </Box>


                    {loginError && (
                        <Fade in={!!loginError}>
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 1,
                                    borderRadius: 2,
                                    alignItems: "center"
                                }}
                                component={motion.div}
                                variants={itemVariants}
                            >
                                {loginError}
                            </Alert>
                        </Fade>
                    )}

                    {/* Username Field */}
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
                                    <Person color={errors.name ? "error" : "action"} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                transition: "all 0.2s ease",
                                "&:hover fieldset": {
                                    borderColor: "primary.main",
                                },
                                "&.Mui-focused fieldset": {
                                    borderWidth: "2px",
                                    borderColor: "primary.main",
                                },
                            }
                        }}
                        component={motion.div}
                        variants={itemVariants}
                    />

                    {/* Password Field */}
                    <FormControl
                        variant="outlined"
                        size="medium"
                        fullWidth
                        error={Boolean(errors.password)}
                        required
                        component={motion.div}
                        variants={itemVariants}
                    >
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <OutlinedInput
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <LockOutlined color={errors.password ? "error" : "action"} />
                                </InputAdornment>
                            }
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        size="medium"
                                        sx={{ color: errors.password ? "error.main" : "action.active" }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                            sx={{
                                borderRadius: 2,
                                transition: "all 0.2s ease",
                                "&:hover fieldset": {
                                    borderColor: "primary.main",
                                },
                                "&.Mui-focused fieldset": {
                                    borderWidth: "2px",
                                    borderColor: "primary.main",
                                },
                            }}
                        />
                        {errors.password && (
                            <FormHelperText sx={{ mx: 0, fontSize: "0.75rem" }}>
                                {errors.password}
                            </FormHelperText>
                        )}
                    </FormControl>

                    {/* Remember me and Forgot password */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                        component={motion.div}
                        variants={itemVariants}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    color="primary"
                                    size={isMobile ? "small" : "medium"}
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "primary.main",
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Remember me
                                </Typography>
                            }
                        />
                        <Button
                            size="small"
                            sx={{
                                textTransform: "none",
                                minWidth: "auto",
                                color: "primary.main",
                                fontWeight: 600,
                                "&:hover": {
                                    background: "rgba(25, 118, 210, 0.04)"
                                }
                            }}
                        >
                            Forgot password?
                        </Button>
                    </Box>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        fullWidth
                        sx={{
                            bgcolor: "#4ca3f5ff",
                            fontWeight: "bold",
                            py: 1.5,
                            fontSize: "1rem",
                            mt: 1,
                            borderRadius: 2,
                            "&:hover": {
                                bgcolor: "primary.dark",
                            },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        component={motion.button}
                        variants={itemVariants}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? "Logging in..." : "Log In"}
                    </Button>
                </Paper>
            </form>
        </Box>
    );
};

export default Login;
