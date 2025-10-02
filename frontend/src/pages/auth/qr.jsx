import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    Fade,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";
import { MuiOtpInput } from "mui-one-time-password-input";
import { VerifiedUser } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
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

const QRVerification = () => {
    const dispatch = useDispatch()
    const { qr } = useSelector((state) => state?.auth)

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (value) => {
        setOtp(value);
        if (error) setError("");
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError("Please enter a 6-digit code.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/auth/2fa/verify`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: otp,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Verify response:", data);
                dispatch(setAuthState(({
                    isTwoFactorPending: false,
                    isTwoFactorVerified: true,
                    isAuthenticated: true,
                })))
            } else {
                setError(data.message || "Verification failed. Please try again.");
            }
        } catch (error) {
            setError("Network error. Please try again.");
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
            {/* Floating Background Shapes */}
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

            <Paper
                elevation={isMobile ? 4 : 12}
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                sx={{
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    width: "100%",
                    maxWidth: 500,
                    p: isMobile ? 3.5 : 4,
                    borderRadius: 4,
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    position: "relative",
                    overflow: "hidden",
                    zIndex: 2,
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
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 4,
                        textAlign: "center"
                    }}
                    component={motion.div}
                    variants={itemVariants}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight="700"
                        color="primary.main"
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
                        Two-Factor Authentication
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            fontWeight: 500,
                            fontSize: isMobile ? '0.85rem' : '1rem',
                            letterSpacing: '0.3px'
                        }}
                    >
                        Scan the QR code with your authenticator app
                    </Typography>
                </Box>

                {error && (
                    <Fade in={!!error}>
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
                                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
                                width: "100%"
                            }}
                            component={motion.div}
                            variants={itemVariants}
                        >
                            {error}
                        </Alert>
                    </Fade>
                )}

                {/* QR Code */}
                {qr && (
                    <Paper
                        elevation={4}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            mb: 4,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            bgcolor: "white",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            width: "100%",
                            maxWidth: 280,
                            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)"
                        }}
                        component={motion.div}
                        variants={itemVariants}
                    >
                        <img
                            src={qr}
                            alt="QR Code"
                            style={{
                                height: "auto",
                                width: "100%",
                                maxWidth: 220,
                                aspectRatio: "1/1",
                                borderRadius: 2
                            }}
                        />
                    </Paper>
                )}

                {/* OTP Input */}
                <Typography
                    variant="subtitle1"
                    mb={3}
                    fontWeight="600"
                    textAlign="center"
                    sx={{
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        color: 'text.primary'
                    }}
                    component={motion.div}
                    variants={itemVariants}
                >
                    Enter 6-digit verification code
                </Typography>

                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        mb: 4
                    }}
                    component={motion.div}
                    variants={itemVariants}
                >
                    <MuiOtpInput
                        value={otp}
                        onChange={handleChange}
                        length={6}
                        sx={{
                            "& .MuiOtpInput-TextField": {
                                "& .MuiOutlinedInput-root": {
                                    width: isMobile ? "2.8rem" : "3.5rem",
                                    height: isMobile ? "2.8rem" : "3.5rem",
                                    fontSize: "1.3rem",
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    "&:hover fieldset": {
                                        borderColor: "primary.main",
                                        borderWidth: "2px"
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderWidth: "2.5px",
                                        borderColor: "primary.main",
                                    },
                                },
                            },
                        }}
                    />
                </Box>

                {/* Verify Button */}
                <Button
                    variant="contained"
                    onClick={handleVerify}
                    disabled={isLoading || otp.length !== 6}
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
                            boxShadow: "none",
                            transform: "none"
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
                        maxWidth: 300,
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
                    {isLoading ? (
                        <Box
                            sx={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                border: "2px solid transparent",
                                borderTop: "2px solid white",
                                display: "inline-block",
                                animation: "spin 1s linear infinite",
                                "@keyframes spin": {
                                    "0%": { transform: "rotate(0deg)" },
                                    "100%": { transform: "rotate(360deg)" }
                                }
                            }}
                        />
                    ) : (
                        <VerifiedUser sx={{ fontSize: isMobile ? "1.2rem" : "1.4rem" }} />
                    )}
                    {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
            </Paper>
        </Box>
    );
};

export default QRVerification;