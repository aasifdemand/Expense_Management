import React from "react";
import {
    Box,
    Typography,
    Card,
    CardContent
} from "@mui/material";

const ExpenseStats = ({ stats, isMobile, isSmallMobile }) => {
    const StatCard = ({ title, value, icon, color, subtitle }) => {
        return (
            <Card
                sx={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    color: "white",
                    borderRadius: 3,
                    boxShadow: 3,
                    height: "100%",
                    minHeight: isSmallMobile ? 120 : 140,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <CardContent sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%"
                }}>
                    <Box sx={{
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "50%",
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem"
                    }}>
                        {icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h4" fontWeight="bold">
                            {value}
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 3,
            mb: 4
        }}>
            {stats.map((stat, index) => (
                <Box sx={{ width: "100%" }} key={index}>
                    <StatCard {...stat} />
                </Box>
            ))}
        </Box>
    );
};

export default ExpenseStats;

