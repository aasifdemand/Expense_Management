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
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                px: 2,
                py: 2,
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    width: "100%",
                    maxWidth: 500,
                    p: isMobile ? 3 : 4,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    bgcolor: "white",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                }}
                component={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>

                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight="600"
                        color="primary.main"
                        textAlign="center"
                        gutterBottom
                    >
                        Two-Factor Authentication
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ fontWeight: 500 }}
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
                                width: "100%"
                            }}
                        >
                            {error}
                        </Alert>
                    </Fade>
                )}

                {
                    qr &&
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
                            maxWidth: 280
                        }}
                    >
                        <img
                            src={qr}
                            alt="QR Code"
                            style={{
                                height: "auto",
                                width: "100%",
                                maxWidth: 220,
                                aspectRatio: "1/1"
                            }}
                        />
                    </Paper>
                }

                {/* OTP Input */}
                <Typography
                    variant="subtitle1"
                    mb={2}
                    fontWeight="500"
                    textAlign="center"
                >
                    Enter 6-digit verification code
                </Typography>

                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 3 }}>
                    <MuiOtpInput
                        value={otp}
                        onChange={handleChange}
                        length={6}
                        sx={{
                            "& .MuiOtpInput-TextField": {
                                "& .MuiOutlinedInput-root": {
                                    width: isMobile ? "2.5rem" : "3rem",
                                    height: isMobile ? "2.5rem" : "3rem",
                                    fontSize: "1.2rem",
                                    borderRadius: 2,
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
                    color="primary"
                    onClick={handleVerify}
                    disabled={isLoading || otp.length !== 6}
                    fullWidth
                    sx={{
                        fontWeight: "bold",
                        py: 1.5,
                        fontSize: "1rem",
                        borderRadius: 2,
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        "&:hover": {
                            bgcolor: "primary.dark",
                            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)"
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


            </Paper>
        </Box>
    );
};

export default QRVerification;