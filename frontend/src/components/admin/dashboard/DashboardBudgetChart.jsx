import { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
} from "@mui/material";
import { StyledSelect } from "../../../styles/budgeting.styles";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DashboardBudgetAreaChart = ({
    theme,
    expenses, // Changed from budgets to expenses
    selectedMonth,
    setSelectedMonth,
    year,
}) => {
    const currentMonth = new Date().getMonth() + 1;
    const monthNumber = Number(selectedMonth) || currentMonth;

    // ✅ Filter expenses for the selected month/year using the correct date field
    const filteredExpenses = useMemo(
        () =>
            expenses?.filter((expense) => {
                if (!expense?.date) return false;
                const date = new Date(expense.date);
                return (
                    date.getMonth() + 1 === monthNumber &&
                    date.getFullYear() === Number(year)
                );
            }) || [],
        [expenses, monthNumber, year]
    );

    const daysInMonth = new Date(Number(year), monthNumber, 0).getDate();

    // ✅ Compute totals per day using the correct expense fields
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        date: `${i + 1}/${monthNumber}/${year}`,
        Allocated: 0,
        Spent: 0,
        Reimbursed: 0,
    }));

    filteredExpenses.forEach((expense) => {
        if (!expense?.date) return;

        const date = new Date(expense.date);
        const day = date.getDate() - 1;

        if (day >= 0 && day < daysInMonth) {
            // Use the correct field names from your expense document
            data[day].Allocated += Number(expense.fromAllocation || 0);
            data[day].Spent += Number(expense.amount || 0);
            data[day].Reimbursed += Number(expense.fromReimbursement || 0);
        }
    });

    // Debug log to check the data
    console.log('Filtered expenses count:', filteredExpenses.length);
    console.log('Daily data:', data);
    console.log('Sample expense:', filteredExpenses[0]);

    return (
        <Box
            sx={{
                mt: 4,
                overflow: "hidden",
                borderRadius: 3,
                width: "100%",
                p: 4
            }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    mb: 2,
                    gap: 2,
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    Daily Expense Overview – {months[monthNumber - 1]} {year}
                </Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Select Month</InputLabel>
                    <StyledSelect
                        value={monthNumber}
                        label="Select Month"
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        MenuProps={{ disableScrollLock: true }}
                    >
                        {months.map((m, i) => (
                            <MenuItem key={i} value={i + 1}>
                                {m}
                            </MenuItem>
                        ))}
                    </StyledSelect>
                </FormControl>
            </Box>

            {/* ✅ Vibrant Area Chart */}
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorReimbursed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip
                        formatter={(value, name) => {
                            const formattedValue = `₹${Number(value).toLocaleString()}`;
                            return [formattedValue, name];
                        }}
                        labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                                return `Date: ${payload[0].payload.date}`;
                            }
                            return `Day: ${label}`;
                        }}
                        contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 8,
                            boxShadow: theme.shadows[3],
                        }}
                    />
                    <Legend verticalAlign="top" height={36} />

                    <Area
                        type="monotone"
                        dataKey="Allocated"
                        stroke={theme.palette.primary.main}
                        fill="url(#colorAllocated)"
                        strokeWidth={2}
                        name="From Allocation"
                    />
                    <Area
                        type="monotone"
                        dataKey="Spent"
                        stroke={theme.palette.error.main}
                        fill="url(#colorSpent)"
                        strokeWidth={2}
                        name="Total Amount"
                    />
                    <Area
                        type="monotone"
                        dataKey="Reimbursed"
                        stroke={theme.palette.success.main}
                        fill="url(#colorReimbursed)"
                        strokeWidth={2}
                        name="From Reimbursement"
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend with better labels */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                    <Typography variant="body2" color="text.secondary">From Allocation</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: theme.palette.error.main, borderRadius: 1 }} />
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: theme.palette.success.main, borderRadius: 1 }} />
                    <Typography variant="body2" color="text.secondary">From Reimbursement</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardBudgetAreaChart;