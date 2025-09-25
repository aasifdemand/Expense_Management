import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { CreditCard, TrendingUp, CurrencyRupee, AccessTime } from "@mui/icons-material";

const BudgetCard = ({ budgetData }) => {
    const items = [
        {
            title: "Total Allocated",
            subtitle: "Monthly budget allocation",
            value: budgetData.monthlyBudget,
            color: "#2563eb", // blue
            icon: <CreditCard fontSize="large" />
        },
        {
            title: "Total Spent",
            subtitle: `${((budgetData.totalSpent / budgetData.monthlyBudget) * 100).toFixed(1)}% of budget used`,
            value: budgetData.totalSpent,
            color: "#ef4444", // red
            icon: <TrendingUp fontSize="large" />
        },
        {
            title: "Remaining Balance",
            subtitle: "Available funds",
            value: budgetData.remainingBalance,
            color: "#10b981", // green
            icon: <CurrencyRupee fontSize="large" />
        },
        {
            title: "Pending Reimbursements",
            subtitle: "Awaiting payment",
            value: budgetData.pendingReimbursements,
            color: "#f59e0b", // yellow
            icon: <AccessTime fontSize="large" />
        },
    ];

    return (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",      // wrap if screen smaller
                gap: 2,
            }}
        >
            {items.map((item) => (
                <Card
                    key={item.title}
                    sx={{
                        flex: "1 1 250px",     // each card flexible, min width ~250px
                        backgroundColor: item.color,
                        color: "white",
                        borderRadius: 2,       // theme spacing → consistent rounded corners
                        boxShadow: 3,
                        height: 120,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <CardContent
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                            p: 2,
                            // consistent padding
                        }}
                    >
                        <Box sx={{ fontSize: 32, display: "flex", alignItems: "center" }}>
                            {item.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                                ₹{item.value.toLocaleString("en-IN")}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {item.title}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {item.subtitle}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>

    );
};

export default BudgetCard;