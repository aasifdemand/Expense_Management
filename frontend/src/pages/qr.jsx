import React, { useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useNavigate } from "react-router-dom";

const QRVerification = () => {
  const qr = JSON?.parse(localStorage?.getItem("qr") || '""');
  const user = JSON?.parse(localStorage?.getItem("user"))
  const [otp, setOtp] = useState("");

  const navigate = useNavigate()

   

  const handleChange = (value) => {
    setOtp(value);
  };

  const handleVerify = async () => {
    if (otp.length === 6) {
     const response = await fetch(`http://localhost:5000/api/v1/auth/2fa/verify`,{
        method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: otp,
                    userId: user._id
                })
     })

     if(response.ok){
        user?.role === "user" ? navigate("/") : navigate("/admin-dashboard")
     }
    } else {
      alert("Please enter a 6-digit code.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        bgcolor: "#f5f7fb",
        px: 2,
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Scan Your QR Code
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 2,
          mb: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "white",
        }}
      >
        <img
          src={qr}
          alt="QR Code"
          style={{ height: 250, width: 250, objectFit: "cover" }}
        />
      </Paper>

      <Typography variant="subtitle1" mb={1}>
        Enter 6-digit OTP
      </Typography>

      <MuiOtpInput
        value={otp}
        onChange={handleChange}
        length={6}
        sx={{
          "& input": {
            width: "3rem",
            height: "3rem",
            fontSize: "1.5rem",
            margin: "0 0.5rem",
            textAlign: "center",
          },
        }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleVerify}
        sx={{ mt: 3, px: 4, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
      >
        Verify OTP
      </Button>
    </Box>
  );
};

export default QRVerification;
