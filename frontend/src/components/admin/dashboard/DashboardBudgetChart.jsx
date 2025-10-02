import { useMemo } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel } from "@mui/material";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DashboardBudgetBarChart = ({ theme, budgets, selectedMonth, setSelectedMonth, year }) => {
    const currentMonth = new Date().getMonth() + 1;
    const monthNumber = Number(selectedMonth) || currentMonth;

    // Filter budgets for the selected month/year
    const filteredBudgets = useMemo(() =>
        budgets?.filter(b => {
            const date = new Date(b.createdAt);
            return date.getMonth() + 1 === monthNumber && date.getFullYear() === Number(year);
        }) || [], [budgets, monthNumber, year]
    );

    const daysInMonth = new Date(Number(year), monthNumber, 0).getDate();

    // Initialize daily arrays
    const allocatedPerDay = Array.from({ length: daysInMonth }, () => 0);
    const spentPerDay = Array.from({ length: daysInMonth }, () => 0);
    const reimbursedPerDay = Array.from({ length: daysInMonth }, () => 0);

    filteredBudgets.forEach(b => {
        const day = new Date(b.createdAt).getDate() - 1;
        if (day >= 0 && day < daysInMonth) {
            allocatedPerDay[day] += Number(b.fromAllocation || 0);
            spentPerDay[day] += Number(b.amount || 0);
            reimbursedPerDay[day] += Number(b.fromReimbursement || 0);
        }
    });

    const xLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

    return (
        <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "background.paper", boxShadow: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Daily Budget – {year}</Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Select Month</InputLabel>
                    <Select value={monthNumber} label="Select Month" onChange={e => setSelectedMonth(Number(e.target.value))}>
                        {months.map((m, i) => <MenuItem key={i} value={i + 1}>{m}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            <BarChart
                series={[
                    { label: "Allocated", data: allocatedPerDay, color: theme.palette.primary.main },
                    { label: "Spent", data: spentPerDay, color: theme.palette.error.main },
                    { label: "Reimbursed", data: reimbursedPerDay, color: theme.palette.success.main },
                ]}
                xAxis={[{ data: xLabels }]}
                height={300}
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
            />
        </Box>
    );
};

export default DashboardBudgetBarChart;
