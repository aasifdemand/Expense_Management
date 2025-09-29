import { useMemo } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel } from "@mui/material";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DashboardExpensesChart = ({ expenses, selectedMonth, setSelectedMonth, year }) => {
    const currentMonth = new Date().getMonth() + 1;
    const monthNumber = Number(selectedMonth) || currentMonth;

    const filteredExpenses = useMemo(
        () =>
            expenses?.filter((e) => {
                const date = new Date(e.createdAt);
                return date.getMonth() + 1 === monthNumber && date.getFullYear() === Number(year);
            }) || [],
        [expenses, monthNumber, year]
    );

    const daysInMonth = new Date(Number(year), monthNumber, 0).getDate();

    const spentPerDay = Array.from({ length: daysInMonth }, () => 0);
    const reimbursedPerDay = Array.from({ length: daysInMonth }, () => 0);
    const pendingPerDay = Array.from({ length: daysInMonth }, () => 0);

    filteredExpenses.forEach((e) => {
        const dayIndex = new Date(e.createdAt).getDate() - 1;
        if (dayIndex >= 0 && dayIndex < daysInMonth) {
            spentPerDay[dayIndex] += e.amount || 0;
            if (e.isReimbursed) {
                reimbursedPerDay[dayIndex] += e.amount || 0;
            } else {
                pendingPerDay[dayIndex] += e.amount || 0;
            }
        }
    });

    return (
        <Box
            sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: 2,
                mb: 4,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    Daily Expenses Breakdown – {year}
                </Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Select Month</InputLabel>
                    <Select
                        value={monthNumber}
                        label="Select Month"
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {months.map((m, i) => (
                            <MenuItem key={m} value={i + 1}>{m}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Stacked Bar Chart */}
            <BarChart
                series={[
                    {
                        data: reimbursedPerDay,
                        label: "Reimbursed",
                        color: "#06d6a0",
                    },
                    {
                        data: pendingPerDay,
                        label: "Pending",
                        color: "#ef476f",
                    },
                ]}
                xAxis={[
                    {
                        scaleType: "band",
                        data: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
                        label: `Days of ${months[monthNumber - 1]}`,
                    },
                ]}
                yAxis={[
                    {
                        label: "Amount (₹)",
                    },
                ]}
                height={350}
                margin={{ left: 70, right: 30, top: 30, bottom: 70 }}
                borderRadius={4}
                grid={{ vertical: true }}
                layout="stacked"
            />
        </Box>
    );
};

export default DashboardExpensesChart;