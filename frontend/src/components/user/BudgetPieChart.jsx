import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const BudgetPieChart = ({ budgetData }) => {
    const theme = useTheme();

    const data = [
        { name: "Spent", value: budgetData.totalSpent, color: "#9333ea" },
        { name: "Remaining", value: budgetData.remainingBalance, color: "#22c55e" },
        { name: "Pending", value: budgetData.pendingReimbursements, color: "#eab308" },
    ];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                fontSize={11}
                fontWeight="600"
                filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.3))"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        boxShadow: theme.shadows[3],
                        p: 1.5
                    }}
                >
                    <Typography variant="body2" fontWeight="600" gutterBottom>
                        {payload[0].name}
                    </Typography>
                    <Typography variant="body2" color={payload[0].payload.color}>
                        ₹{payload[0].value.toLocaleString("en-IN")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {((payload[0].payload.value / budgetData.monthlyBudget) * 100).toFixed(1)}% of total
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2, flexWrap: "wrap" }}>
            {payload.map((entry, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: entry.color,
                        }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {entry.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        (₹{data.find(d => d.name === entry.value)?.value.toLocaleString("en-IN")})
                    </Typography>
                </Box>
            ))}
        </Box>
    );

    return (
        <Card
            sx={{
                height: "100%",
                boxShadow: theme.shadows[2],
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.3s ease-in-out",
                '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: "translateY(-2px)"
                }
            }}
        >
            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", p: 3 }}>
                <Typography
                    variant="h6"
                    textAlign="center"
                    gutterBottom
                    sx={{
                        fontWeight: "700",
                        color: theme.palette.text.primary,
                        mb: 3,
                        fontSize: "1.25rem"
                    }}
                >
                    Budget Distribution
                </Typography>

                <Box sx={{ flexGrow: 1, minHeight: 300, display: "flex", alignItems: "center" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius="45%"
                                outerRadius="75%"
                                paddingAngle={2}
                                label={renderCustomLabel}
                                labelLine={false}
                                stroke={theme.palette.background.paper}
                                strokeWidth={2}
                            >
                                {data.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>

                <Box
                    sx={{
                        textAlign: "center",
                        mt: 3,
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="600" color="text.primary" gutterBottom>
                        Total Budget
                    </Typography>
                    <Typography
                        variant="h6"
                        fontWeight="700"
                        color="primary.main"
                        sx={{ fontSize: "1.5rem" }}
                    >
                        ₹{budgetData.monthlyBudget.toLocaleString("en-IN")}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default BudgetPieChart;