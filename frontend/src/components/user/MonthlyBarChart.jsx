import { Card, CardContent, Typography, Box, useTheme, Chip, Stack } from "@mui/material";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, Circle } from '@mui/icons-material';

const CHART_HEIGHT = 400;

const monthlyTotals = [
    { month: "Jan", total: 3000, approved: 2500, pending: 300, rejected: 200 },
    { month: "Feb", total: 4500, approved: 4000, pending: 200, rejected: 300 },
    { month: "Mar", total: 5000, approved: 4800, pending: 100, rejected: 100 },
    { month: "Apr", total: 5200, approved: 4900, pending: 150, rejected: 150 },
    { month: "May", total: 4800, approved: 4500, pending: 200, rejected: 100 },
    { month: "Jun", total: 6000, approved: 5500, pending: 300, rejected: 200 },
    { month: "Jul", total: 5800, approved: 5400, pending: 250, rejected: 150 },
    { month: "Aug", total: 6200, approved: 5800, pending: 300, rejected: 100 },
    { month: "Sep", total: 5500, approved: 5200, pending: 200, rejected: 100 },
    { month: "Oct", total: 6700, approved: 6300, pending: 250, rejected: 150 },
    { month: "Nov", total: 7100, approved: 6700, pending: 300, rejected: 100 },
    { month: "Dec", total: 7500, approved: 7100, pending: 350, rejected: 50 },
];

const STATUS_COLORS = {
    total: { primary: "#3b82f6" },
    approved: { primary: "#10b981" },
    pending: { primary: "#f59e0b" },
    rejected: { primary: "#ef4444" },
};

const CustomTooltip = ({ active, payload, label }) => {
    const theme = useTheme();
    if (active && payload && payload.length) {
        const total = payload.find(p => p.dataKey === 'total')?.value || 0;
        return (
            <Box sx={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, boxShadow: theme.shadows[4], p: 2, minWidth: 200 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>{label}</Typography>
                {payload.map((entry, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Circle sx={{ fontSize: 8, color: entry.color }} />
                            <Typography variant="body2" fontWeight={500}>{entry.name}:</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>₹{entry.value.toLocaleString('en-IN')}</Typography>
                    </Box>
                ))}
                <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary">Total: ₹{total.toLocaleString('en-IN')}</Typography>
                </Box>
            </Box>
        );
    }
    return null;
};

const CustomLegend = ({ payload }) => {
    const theme = useTheme();
    return (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2, p: 2, backgroundColor: theme.palette.background.default, borderRadius: 2, flexWrap: 'wrap' }}>
            {payload && payload.map((entry, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: entry.color }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{entry.value}</Typography>
                </Box>
            ))}
        </Stack>
    );
};

// Rounded bar shape
const CustomBar = (props) => {
    const { fill, x, y, width, height } = props;
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />;
};

export default function MonthlyTotalsChart() {
    const theme = useTheme();
    const currentMonth = monthlyTotals[monthlyTotals.length - 1];
    const previousMonth = monthlyTotals[monthlyTotals.length - 2];
    const growthPercentage = previousMonth ? ((currentMonth.total - previousMonth.total) / previousMonth.total * 100).toFixed(1) : 0;

    return (
        <Card sx={{ width: "100%", height: "100%", boxShadow: theme.shadows[3], border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Monthly Expense Analytics</Typography>
                        <Typography variant="body2" color="text.secondary">Overview of expense trends and status distribution</Typography>
                    </Box>
                    <Chip icon={<TrendingUp sx={{ fontSize: 16 }} />} label={`${growthPercentage}% growth`} variant="outlined" color={growthPercentage >= 0 ? "success" : "error"} size="small" sx={{ fontWeight: 600 }} />
                </Box>

                {/* ✅ Same height as PieChart */}
                <Box sx={{ flexGrow: 1, height: CHART_HEIGHT }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTotals} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                            <Bar dataKey="total" name="Total Expenses" fill={STATUS_COLORS.total.primary} shape={<CustomBar />} />
                            <Bar dataKey="approved" name="Approved" fill={STATUS_COLORS.approved.primary} shape={<CustomBar />} />
                            <Bar dataKey="pending" name="Pending" fill={STATUS_COLORS.pending.primary} shape={<CustomBar />} />
                            <Bar dataKey="rejected" name="Rejected" fill={STATUS_COLORS.rejected.primary} shape={<CustomBar />} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 2, mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">Current Month</Typography>
                        <Typography variant="h6" fontWeight={700} color={STATUS_COLORS.total.primary}>₹{currentMonth.total.toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">Approval Rate</Typography>
                        <Typography variant="h6" fontWeight={700} color={STATUS_COLORS.approved.primary}>{((currentMonth.approved / currentMonth.total) * 100).toFixed(1)}%</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">YTD Total</Typography>
                        <Typography variant="h6" fontWeight={700} color={STATUS_COLORS.total.primary}>₹{monthlyTotals.reduce((sum, m) => sum + m.total, 0).toLocaleString('en-IN')}</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}