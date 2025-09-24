import React, { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { setAuthState, csrf } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  console.log("csrf: ", csrf);


  const handleLogout = async () => {
    setIsLoading(true);

    // if (!csrf) return

    try {
      console.log("Attempting logout. CSRF:", csrf);

      const response = await fetch("http://localhost:5000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include", // send cookies/session
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
      });

      if (response.ok) {
        console.log("✅ Logout successful");

        // Clear localStorage
        localStorage.clear();

        // Reset AuthContext
        setAuthState({
          isAuthenticated: false,
          isTwoFactorVerified: false,
          isTwoFactorPending: false,
          role: null,
          userId: null,
          qr: null,
        });

        // Redirect to login
        navigate("/login");
      } else {
        const data = await response.json().catch(() => ({}));
        console.error("❌ Logout failed:", response.status, data?.message);
      }
    } catch (error) {
      console.error("⚠️ Network error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Welcome to User Dashboard
      </Typography>

      <Button
        variant="contained"
        color="error"
        onClick={handleLogout}
        sx={{ px: 4, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
      >
        {isLoading ? "Logging out..." : "Logout"}
      </Button>
    </Box>
  );
};

export default Dashboard;
