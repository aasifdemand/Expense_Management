import { Grid, Card, CardContent, Typography, Box, Container, useMediaQuery } from "@mui/material";
import { CreditCard, TrendingUp, CurrencyRupee, AccessTime } from "@mui/icons-material";

const BudgetCard = ({ budgetData }) => {
    const isSmallMobile = useMediaQuery("(max-width:400px)");

    const items = [
        {
            title: "Total Allocated",
            value: `₹${(budgetData?.monthlyBudget || 0).toLocaleString("en-IN")}`,
            icon: <CreditCard fontSize="large" />,
            color: "#4361ee",
            subtitle: "Monthly budget allocation"
        },
        {
            title: "Total Spent",
            value: `₹${(budgetData?.totalSpent || 0).toLocaleString("en-IN")}`,
            icon: <TrendingUp fontSize="large" />,
            color: "#ef476f",
            subtitle: `${budgetData?.monthlyBudget ? ((budgetData.totalSpent / budgetData.monthlyBudget) * 100).toFixed(1) : '0'}% of budget used`
        },
        {
            title: "Remaining Balance",
            value: `₹${(budgetData?.remainingBalance || 0).toLocaleString("en-IN")}`,
            icon: <CurrencyRupee fontSize="large" />,
            color: "#06d6a0",
            subtitle: "Available funds"
        },
        {
            title: "Pending Reimbursements",
            value: (budgetData?.pendingReimbursements || 0).toString(),
            icon: <AccessTime fontSize="large" />,
            color: "#ffd166",
            subtitle: "Awaiting payment"
        },
    ];

    const StatCard = ({ title, value, icon, color, subtitle }) => {
        return (
            <Card
                sx={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    color: "white",
                    borderRadius: 3,
                    boxShadow: 3,
                    height: "100%",
                    minHeight: isSmallMobile ? 120 : 140, // EXACT SAME HEIGHT
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <CardContent sx={{
                    p: 2, // EXACT SAME PADDING
                    display: "flex",
                    alignItems: "center",
                    gap: 6, // EXACT SAME GAP
                    width: "100%"
                }}>
                    <Box sx={{
                        bgcolor: "rgba(199, 184, 184, 0.2)", // EXACT SAME COLOR
                        borderRadius: "50%",
                        p: 1.5, // EXACT SAME PADDING
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
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
                        {subtitle && <Typography variant="body2">{subtitle}</Typography>}
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 6, mb: 4 }}>
            {/* EXACT SAME LAYOUT AS ADMINDASHBOARD */}
            <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                {items.map((item, index) => (
                    <Box sx={{ width: "100%" }} key={index}>
                        <StatCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            color={item.color}
                            subtitle={item.subtitle}
                        />
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default BudgetCard;