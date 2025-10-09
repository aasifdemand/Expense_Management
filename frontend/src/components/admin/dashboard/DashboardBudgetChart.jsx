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
    budgets,
    selectedMonth,
    setSelectedMonth,
    year,
}) => {
    const currentMonth = new Date().getMonth() + 1;
    const monthNumber = Number(selectedMonth) || currentMonth;

    // ✅ Filter data for the selected month/year
    const filteredBudgets = useMemo(
        () =>
            budgets?.filter((b) => {
                const date = new Date(b.createdAt);
                return (
                    date.getMonth() + 1 === monthNumber &&
                    date.getFullYear() === Number(year)
                );
            }) || [],
        [budgets, monthNumber, year]
    );

    const daysInMonth = new Date(Number(year), monthNumber, 0).getDate();

    // ✅ Compute totals per day
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        Allocated: 0,
        Spent: 0,
        Reimbursed: 0,
    }));

    filteredBudgets.forEach((b) => {
        const day = new Date(b.createdAt).getDate() - 1;
        if (day >= 0 && day < daysInMonth) {
            data[day].Allocated += Number(b.fromAllocation || 0);
            data[day].Spent += Number(b.amount || 0);
            data[day].Reimbursed += Number(b.fromReimbursement || 0);
        }
    });

    return (
        <Box
            sx={{
                mt: 4,
                overflow: "hidden",
                borderRadius: 3,
                // bgcolor: "background.paper",

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
                    Daily Budget Overview – {months[monthNumber - 1]} {year}
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
                <AreaChart data={data} >
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
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
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
                    />
                    <Area
                        type="monotone"
                        dataKey="Spent"
                        stroke={theme.palette.error.main}
                        fill="url(#colorSpent)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="Reimbursed"
                        stroke={theme.palette.success.main}
                        fill="url(#colorReimbursed)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default DashboardBudgetAreaChart;
