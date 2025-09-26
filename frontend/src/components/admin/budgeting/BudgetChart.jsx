import { useMemo } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import {
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
} from "@mui/material";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const BudgetChart = ({ theme, budgets, selectedMonth, setSelectedMonth, year }) => {
    const currentMonth = new Date().getMonth() + 1;
    const monthNumber = Number(selectedMonth) || currentMonth;

    const filteredBudgets = useMemo(
        () =>
            budgets?.filter(
                (b) => Number(b.month) === monthNumber && Number(b.year) === Number(year)
            ) || [],
        [budgets, monthNumber, year]
    );

    const daysInMonth = new Date(Number(year), monthNumber, 0).getDate();

    const allocatedPerDay = Array.from({ length: daysInMonth }, () => 0);
    const spentPerDay = Array.from({ length: daysInMonth }, () => 0);

    filteredBudgets.forEach((b) => {
        const day = new Date(b.createdAt).getDate() - 1;
        if (day >= 0 && day < daysInMonth) {
            allocatedPerDay[day] += b.allocatedAmount || 0;
            spentPerDay[day] += b.spentAmount || 0;
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
                mb: 4
            }}
        >
            {/* Header with Title + Dropdown */}
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
                    Budget Analysis – {year}
                </Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Select Month</InputLabel>
                    <Select
                        value={monthNumber}
                        label="Select Month"
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                        {months.map((m, i) => (
                            <MenuItem key={m} value={i + 1}>
                                {m}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Chart */}
            <BarChart
                xAxis={[
                    {
                        scaleType: "band",
                        data: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
                        label: `${selectedMonth}`,
                    },
                ]}
                series={[
                    {
                        data: allocatedPerDay,
                        label: "Allocated",
                        color: theme.palette.primary.main,
                    },
                    {
                        data: spentPerDay,
                        label: "Spent",
                        color: theme.palette.secondary.main,
                    },
                ]}
                height={350}
                margin={{ left: 70, right: 30, top: 30, bottom: 50 }}
            />
        </Box>
    );
};

export default BudgetChart;
