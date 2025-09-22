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
import { useNavigate } from "react-router-dom";
import { VerifiedUser, QrCodeScanner, Refresh } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const QRVerification = () => {
    const { authState, setAuthState } = useAuth();

    // const user = JSON?.parse(localStorage?.getItem("user"));
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // console.log(user);

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
            const response = await fetch(`http://localhost:5000/api/v1/auth/2fa/verify`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: otp,
                    userId: authState?.userId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Verify response:", data);

                setAuthState((prev) => ({
                    ...prev,
                    isTwoFactorPending: false,
                    isTwoFactorVerified: true,
                    isAuthenticated: true,
                }));

                // if (authState.role === "user") navigate("/");
                // else navigate("/admin-dashboard");
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
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #1868b7 0%, #5fdc87 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                px: isMobile ? 1 : 2,
                py: 2,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 20%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 20%)",
                    pointerEvents: "none"
                }
            }}
        >
            <Paper
                elevation={isMobile ? 4 : 8}
                sx={{
                    width: "100%",
                    maxWidth: isTablet ? 400 : 500,
                    p: isMobile ? 2.5 : 4,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    bgcolor: "white",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                    mx: isMobile ? 1.5 : 0,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "6px",
                        background: "linear-gradient(90deg, #1868b7 0%, #5fdc87 100%)",
                        borderRadius: "3px 3px 0 0"
                    }
                }}
                component={motion.div}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 3,
                    textAlign: "center",
                    width: "100%"
                }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 70,
                            height: 70,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            mb: 2,
                            color: "white",
                        }}
                    >
                        <QrCodeScanner sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        component="h1"
                        fontWeight="700"
                        color="#333"
                        gutterBottom
                        sx={{
                            bgcolor: "primary.dark",
                            backgroundClip: "text",
                            textFillColor: "transparent",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Two-Factor Authentication
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontWeight: 500,
                            maxWidth: "80%"
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
                                borderRadius: 2,
                                alignItems: "center",
                                width: "100%",
                                boxShadow: "0 2px 8px rgba(239, 83, 80, 0.2)"
                            }}
                        >
                            {error}
                        </Alert>
                    </Fade>
                )}

                {/* QR Code */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        mb: 3,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: "white",
                        border: "1px solid #e0e0e0",
                        width: "100%",
                        maxWidth: isMobile ? 220 : 280
                    }}
                >
                    <img
                        src={authState?.qr}
                        alt="QR Code"
                        style={{
                            height: "auto",
                            width: "100%",
                            maxWidth: isMobile ? 180 : 220,
                            aspectRatio: "1/1"
                        }}
                    />
                </Paper>

                {/* OTP Input */}
                <Typography
                    variant="subtitle1"
                    mb={2}
                    fontWeight="600"
                    textAlign="center"
                    color="text.primary"
                >
                    Enter 6-digit verification code
                </Typography>

                <Box sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                    px: isMobile ? 1 : 0
                }}>
                    <MuiOtpInput
                        value={otp}
                        onChange={handleChange}
                        length={6}
                        sx={{
                            gap: isMobile ? 1 : 1.5,
                            "& .MuiOtpInput-TextField": {
                                "& .MuiOutlinedInput-root": {
                                    width: isMobile ? "2.2rem" : "2.8rem",
                                    height: isMobile ? "2.2rem" : "2.8rem",
                                    fontSize: isMobile ? "1rem" : "1.2rem",
                                    borderRadius: 1.5,
                                    "&:hover fieldset": {
                                        borderColor: "primary.main",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderWidth: "2px",
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
                        bgcolor: "#4ca3f5ff",
                        fontWeight: "bold",
                        py: 1.5,
                        fontSize: "1rem",
                        borderRadius: 2,
                        boxShadow: "0 4px 10px rgba(24, 104, 183, 0.4)",
                        "&:hover": {
                            bgcolor: "primary.dark",
                            boxShadow: "0 6px 12px rgba(24, 104, 183, 0.5)",
                        },
                        "&.Mui-disabled": {
                            background: "#e0e0e0",
                            color: "#a0a0a0"
                        },
                        transition: "all 0.2s ease",
                        maxWidth: 300
                    }}
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
                                mr: 1,
                                animation: "spin 1s linear infinite",
                                "@keyframes spin": {
                                    "0%": { transform: "rotate(0deg)" },
                                    "100%": { transform: "rotate(360deg)" }
                                }
                            }}
                        />
                    ) : (
                        <VerifiedUser sx={{ mr: 1, fontSize: 20 }} />
                    )}
                    {isLoading ? "Verifying..." : "Verify Code"}
                </Button>

                {/* Help text */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    mt={3}
                    sx={{ fontWeight: 500 }}
                >
                    Having trouble?{" "}
                    <Button
                        variant="text"
                        size="small"
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: "primary.main",
                        }}
                        startIcon={<Refresh />}
                    >
                        Resend code
                    </Button>
                </Typography>
            </Paper>
        </Box>
    );
};

export default QRVerification;