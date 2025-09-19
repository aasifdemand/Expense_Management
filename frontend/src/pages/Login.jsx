import React, { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography,
    IconButton,
    FormHelperText,
} from "@mui/material";

import {
    Person,
    Shield,
    Visibility,
    VisibilityOff,
    LockOutlined,
    ExpandMore,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        role: "user",
        name: "",
        password: "",
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value, checked, type } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validate = () => {
        let tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "Name is required";
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData?.name,
                    password: formData?.password
                })
            })

            const data = await response.json();

            if (response.ok) {
                console.log(data);
                localStorage.setItem("user",JSON.stringify(data.user))
                localStorage.setItem("qr",JSON.stringify(data.qr))
                navigate("/qr")
            }

        } catch (error) {
            console.log(error?.message);

            setIsLoading(false)
        }
        finally {
            setIsLoading(false)
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#e3f2fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    bgcolor: "white",
                    p: 3, // less padding
                    borderRadius: 3,
                    boxShadow: "0 8px 20px rgb(0 0 0 / 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5, // less gap between elements
                }}
                noValidate
                autoComplete="off"
            >
                <Typography variant="h5" align="center" gutterBottom>
                    Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" mb={1}>
                    Sign in to your Expense Tracker account
                </Typography>

                {/* Role Select */}
                <FormControl fullWidth variant="outlined" size="small" error={Boolean(errors.role)}>
                    <InputLabel id="role-label">Login as</InputLabel>
                    <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={formData.role}
                        label="Login as"
                        onChange={handleChange}
                        endAdornment={
                            <InputAdornment position="end">
                                <ExpandMore />
                            </InputAdornment>
                        }
                        startAdornment={
                            <InputAdornment position="start" sx={{ mr: 1 }}>
                                {formData.role === "admin" ? (
                                    <Shield color="primary" />
                                ) : (
                                    <Person color="primary" />
                                )}
                            </InputAdornment>
                        }
                    >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="admin">Super Admin</MenuItem>
                    </Select>
                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                </FormControl>

                {/* Name (instead of Email) */}
                <TextField
                    label="Name"
                    name="name"
                    variant="outlined"
                    size="small"
                    value={formData.name || ""}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    required
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Person color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Password */}
                <FormControl variant="outlined" size="small" fullWidth error={Boolean(errors.password)} required>
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <OutlinedInput
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        startAdornment={
                            <InputAdornment position="start">
                                <LockOutlined color="action" />
                            </InputAdornment>
                        }
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    size="small"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                    {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
                </FormControl>

                {/* Remember me and Forgot password */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                color="primary"
                                size="small"
                            />
                        }
                        label="Remember me"
                    />
                    <Button size="small" sx={{ textTransform: "none", minWidth: "auto", p: 0 }}>
                        Forgot password?
                    </Button>
                </Box>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="contained"
                    size="medium" // smaller than large, but still comfortable
                    disabled={isLoading}
                    fullWidth
                    sx={{
                        bgcolor: "primary.main",
                        fontWeight: "bold",
                        py: 1.5,
                        fontSize: "0.9rem",
                    }}
                >
                    {isLoading ? "Signing in..." : `Sign in as ${formData.role === "admin" ? "Administrator" : "User"}`}
                </Button>

                {/* Sign up */}
                <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                    Don't have an account?{" "}
                    <Button variant="text" size="small" sx={{ textTransform: "none" }}>
                        Sign up here
                    </Button>
                </Typography>
            </Box>
        </Box>

    );
};

export default Login;
