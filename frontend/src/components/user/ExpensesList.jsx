import React, { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    Box,
    IconButton,
    Tooltip,
    Avatar,
    LinearProgress,
    InputAdornment,
    Divider,
    useTheme,
} from "@mui/material";
import {
    Search,
    Download,
    Visibility,
    Edit,
    Delete,
    Add,
    TrendingUp,
    Schedule,
    CheckCircle,
    Receipt,
    FilterAlt,
    BusinessCenter,
    LocalAtm,
} from "@mui/icons-material";

// Mock data
const mockExpenses = [
    {
        id: 1,
        description: "Client Dinner Meeting",
        amount: 256.5,
        date: "2024-01-15",
        category: "Meals & Entertainment",
        status: "approved",
        receipt: "receipt_1.pdf",
        submittedDate: "2024-01-16",
        approvedDate: "2024-01-18",
        reimbursedAmount: 256.5,
    },
    {
        id: 2,
        description: "Flight to Conference",
        amount: 845.0,
        date: "2024-01-10",
        category: "Travel",
        status: "pending",
        receipt: "receipt_2.pdf",
        submittedDate: "2024-01-12",
        approvedDate: null,
        reimbursedAmount: 0,
    },
    {
        id: 3,
        description: "Office Supplies",
        amount: 125.75,
        date: "2024-01-08",
        category: "Office Expenses",
        status: "rejected",
        receipt: "receipt_3.pdf",
        submittedDate: "2024-01-09",
        approvedDate: null,
        reimbursedAmount: 0,
    },
    {
        id: 4,
        description: "Software Subscription",
        amount: 299.0,
        date: "2024-01-05",
        category: "Software",
        status: "reimbursed",
        receipt: "receipt_4.pdf",
        submittedDate: "2024-01-06",
        approvedDate: "2024-01-08",
        reimbursedAmount: 299.0,
    },
    {
        id: 5,
        description: "Hotel Accommodation",
        amount: 420.0,
        date: "2024-01-20",
        category: "Travel",
        status: "pending",
        receipt: "receipt_5.pdf",
        submittedDate: "2024-01-21",
        approvedDate: null,
        reimbursedAmount: 0,
    },
];

const ExpenseList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const theme = useTheme();

    const statusConfig = {
        pending: {
            color: "warning",
            label: "Pending Review",
            icon: <Schedule fontSize="small" />,
        },
        approved: {
            color: "info",
            label: "Approved",
            icon: <CheckCircle fontSize="small" />,
        },
        reimbursed: {
            color: "success",
            label: "Reimbursed",
            icon: <LocalAtm fontSize="small" />,
        },
        rejected: {
            color: "error",
            label: "Rejected",
            icon: <Delete fontSize="small" />,
        },
    };

    // Filter + Search
    const filteredExpenses = useMemo(() => {
        return mockExpenses.filter((expense) => {
            const matchesSearch =
                expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "all" || expense.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, statusFilter]);

    // Stats
    const statistics = useMemo(() => {
        const totalExpenses = mockExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );
        const pendingExpenses = mockExpenses
            .filter((e) => e.status === "pending")
            .reduce((sum, e) => sum + e.amount, 0);
        const reimbursedExpenses = mockExpenses
            .filter((e) => e.status === "reimbursed")
            .reduce((sum, e) => sum + e.amount, 0);
        const approvedExpenses = mockExpenses
            .filter((e) => e.status === "approved")
            .reduce((sum, e) => sum + e.amount, 0);
        return {
            totalExpenses,
            pendingExpenses,
            reimbursedExpenses,
            approvedExpenses,
        };
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Box sx={{ p: 2, maxWidth: "1400px", margin: "0 auto" }}>
            {/* Filters + Search (moved closer to top with less space) */}
            <Card
                sx={{
                    mb: 1, // reduced spacing
                    borderRadius: 2,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
            >
                <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search by description or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: "text.secondary" }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                select
                                variant="outlined"
                                label="Filter by Status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FilterAlt
                                                sx={{ color: "text.secondary", fontSize: 20 }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                <MenuItem value="all">All Statuses</MenuItem>
                                <MenuItem value="pending">Pending Review</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="reimbursed">Reimbursed</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    justifyContent: { xs: "flex-start", md: "flex-end" },
                                }}
                            >
                                <Tooltip title="Export Expense Report">
                                    <IconButton
                                        sx={{
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            p: 1.2,
                                        }}
                                    >
                                        <Download />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Submit New Expense">
                                    <IconButton
                                        color="primary"
                                        sx={{
                                            background:
                                                "linear-gradient(135deg, #1976d2 0%, #004ba0 100%)",
                                            color: "white",
                                            borderRadius: 2,
                                            p: 1.2,
                                            "&:hover": {
                                                background:
                                                    "linear-gradient(135deg, #1565c0 0%, #003d80 100%)",
                                            },
                                        }}
                                    >
                                        <Add />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Expense Records */}
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    mb: 3,
                }}
            >
                <CardContent sx={{ p: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
                    >
                        Expense Records
                        <Chip
                            label={`${filteredExpenses.length} items`}
                            size="small"
                            sx={{
                                ml: 2,
                                background: "rgba(25, 118, 210, 0.08)",
                                color: "primary.main",
                                fontWeight: 500,
                            }}
                        />
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        backgroundColor: theme.palette.background.default, // ✅ adaptive bg
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                                        Expense Details
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                                        Category
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                                        Date
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{ fontWeight: 600, color: "text.primary" }}
                                    >
                                        Amount
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                                        Status
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{ fontWeight: 600, color: "text.primary" }}
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredExpenses.map((expense) => (
                                    <TableRow
                                        key={expense.id}
                                        hover
                                        sx={{
                                            backgroundColor: theme.palette.background.paper, // ✅ adaptive rows
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: "primary.main",
                                                        mr: 2,
                                                        width: 36,
                                                        height: 36,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {expense.description.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight="600"
                                                        color="text.primary"
                                                    >
                                                        {expense.description}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Submitted: {formatDate(expense.submittedDate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={expense.category}
                                                size="small"
                                                variant="outlined"
                                                icon={<BusinessCenter sx={{ fontSize: 16 }} />}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight="500"
                                                color="text.primary"
                                            >
                                                {formatDate(expense.date)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                variant="body2"
                                                fontWeight="700"
                                                color="text.primary"
                                            >
                                                {formatCurrency(expense.amount)}
                                            </Typography>
                                            {expense.reimbursedAmount > 0 && (
                                                <Typography
                                                    variant="caption"
                                                    color="success.main"
                                                    fontWeight="500"
                                                >
                                                    ✓ Reimbursed:{" "}
                                                    {formatCurrency(expense.reimbursedAmount)}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={statusConfig[expense.status].icon}
                                                label={statusConfig[expense.status].label}
                                                color={statusConfig[expense.status].color}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                <Tooltip title="View Details">
                                                    <IconButton size="small">
                                                        <Visibility sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Expense">
                                                    <IconButton size="small" color="primary">
                                                        <Edit sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Expense">
                                                    <IconButton size="small" color="error">
                                                        <Delete sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredExpenses.length === 0 && (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                            <Receipt
                                sx={{
                                    fontSize: 64,
                                    color: "text.secondary",
                                    mb: 2,
                                    opacity: 0.5,
                                }}
                            />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No expenses found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try adjusting your search or filters
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Reimbursement Progress Overview */}
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}
                    >
                        <TrendingUp sx={{ mr: 1, fontSize: 22 }} />
                        Reimbursement Progress Overview
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 1,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="600">
                                        Pending Approval
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        color="warning.main"
                                    >
                                        {formatCurrency(statistics.pendingExpenses)}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        (statistics.pendingExpenses / statistics.totalExpenses) *
                                        100
                                    }
                                    color="warning"
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 1,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="600">
                                        Approved & Ready
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        color="info.main"
                                    >
                                        {formatCurrency(statistics.approvedExpenses)}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        ((statistics.totalExpenses -
                                            statistics.pendingExpenses -
                                            statistics.reimbursedExpenses) /
                                            statistics.totalExpenses) *
                                        100
                                    }
                                    color="info"
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 1,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="600">
                                        Reimbursed
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        color="success.main"
                                    >
                                        {formatCurrency(statistics.reimbursedExpenses)}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        (statistics.reimbursedExpenses / statistics.totalExpenses) *
                                        100
                                    }
                                    color="success"
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ExpenseList;