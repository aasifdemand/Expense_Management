import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage or tokens
    localStorage.clear();

    // Navigate back to login page
    navigate("/login");
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
        Welcome to Admin Dashboard
      </Typography>

      <Button
        variant="contained"
        color="error"
        onClick={handleLogout}
        sx={{ px: 4, py: 1.5, fontWeight: "bold", borderRadius: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default AdminDashboard;
