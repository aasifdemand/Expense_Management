import { Box, Typography, Card, CardContent, alpha } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAllUsers } from "../../store/authSlice";

// Icons
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BudgetForm from "../../components/admin/budgeting/BudgetForm";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";

const Budgeting = () => {
    // const theme = useTheme();
    const dispatch = useDispatch();

    const {
        allBudgets,
        budgets,
        loading,
        meta,
        users,
        // year,
        page,
        setPage,
        formData,
        setFormData,
        open,
        handleOpen,
        handleClose,
        handleChange,
        handleAdd,
        handleSubmit,
        search,
        setSearch,
        filterMonth,
        setFilterMonth,
        filterYear,
        setFilterYear,
        getMonthByNumber,
        setLimit,
        limit,
        // selectedMonth,
        // setSelectedMonth
    } = useBudgeting();

    // Budget Stats Calculations
    const totalAllocated =
        allBudgets?.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0) || 0;

    const totalSpent =
        allBudgets?.reduce((acc, b) => acc + (b.spentAmount || 0), 0) || 0;

    const remainingBalance = totalAllocated - totalSpent;
    const budgetUsagePercentage =
        totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

    // Budget Stats Cards
    const budgetStats = [
        {
            title: "Total Allocated",
            value: `₹${totalAllocated.toLocaleString()}`,
            icon: <AccountBalanceIcon />,
            color: "#3b82f6",
            subtitle: "Total budget allocation",
            trend: "+12.5%",
            trendColor: "#10b981"
        },
        {
            title: "Total Expenses",
            value: `₹${totalSpent.toLocaleString()}`,
            icon: <TrendingUpIcon />,
            color: "#ef4444",
            subtitle: `${budgetUsagePercentage}% of budget used`,
            trend: "+8.3%",
            trendColor: "#ef4444"
        },
        {
            title: "Remaining Balance",
            value: `₹${remainingBalance.toLocaleString()}`,
            icon: <CreditCardIcon />,
            color: "#10b981",
            subtitle: "Available funds",
            trend: "+15.7%",
            trendColor: "#10b981"
        },
        {
            title: "Budget Allocations",
            value: allBudgets?.length || 0,
            icon: <AttachMoneyIcon />,
            color: "#f59e0b",
            subtitle: "Total allocations",
            trend: "+5.2%",
            trendColor: "#10b981"
        }
    ];

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Reusable StatCard Component (same as AdminDashboard)
    const StatCard = ({ stat }) => (
        <Card
            sx={{
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                height: { xs: "130px", sm: "140px", md: "150px" },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                flex: 1,
                minWidth: { xs: "calc(50% - 10px)", sm: "200px", md: "240px" },
                maxWidth: { xs: "calc(50% - 10px)", sm: "none" },
                "&:hover": {
                    transform: { xs: "none", sm: "translateY(-4px)" },
                    boxShadow: {
                        xs: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        sm: "0 8px 32px rgba(0, 0, 0, 0.12)"
                    }
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(
                        stat.color,
                        0.7
                    )} 100%)`
                }
            }}
        >
            <CardContent
                sx={{
                    p: { xs: 2, sm: 3 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}
            >
                {/* Top Section */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: { xs: 1.5, sm: 2 }
                    }}
                >
                    {/* Icon + Value */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1, sm: 2 },
                            flex: 1,
                            minWidth: 0
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: alpha(stat.color, 0.1),
                                borderRadius: { xs: "10px", sm: "12px" },
                                p: { xs: 1, sm: 1.5 },
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `1px solid ${alpha(stat.color, 0.2)}`,
                                flexShrink: 0
                            }}
                        >
                            {stat.icon}
                        </Box>
                        <Typography
                            variant="h4"
                            sx={{
                                color: "#1e293b",
                                fontWeight: 700,
                                fontSize: {
                                    xs: "1.1rem",
                                    sm: "1.4rem",
                                    md: "1.6rem",
                                    lg: "1.8rem"
                                },
                                lineHeight: 1.1,
                                wordBreak: "break-word",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}
                        >
                            {stat.value}
                        </Typography>
                    </Box>

                    {/* Trend */}
                    {/* <Box
                        sx={{
                            backgroundColor:
                                stat.trendColor === "#ef4444"
                                    ? alpha("#fef2f2", 0.8)
                                    : alpha("#f0fdf4", 0.8),
                            color: stat.trendColor,
                            padding: { xs: "4px 8px", sm: "6px 10px" },
                            borderRadius: "12px",
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                            fontWeight: 700,
                            border: `1px solid ${alpha(stat.trendColor, 0.2)}`,
                            flexShrink: 0,
                            ml: 1
                        }}
                    >
                        {stat.trend}
                    </Box> */}
                </Box>

                {/* Bottom Section */}
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "#1e293b",
                            fontWeight: 700,
                            fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                            lineHeight: 1.2,
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {stat.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6b7280",
                            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                            fontWeight: 600,
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {stat.subtitle}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, width: "100%", maxWidth: "100%" }}>
            {/* Stats Section */}
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                {/* <Typography
                    variant="h4"
                    sx={{
                        mb: { xs: 2, sm: 3 },
                        fontWeight: 700,
                        color: "#1e293b",
                        fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem", lg: "2rem" }
                    }}
                >
                    Budget Overview
                </Typography> */}
                <Box
                    sx={{
                        display: "flex",
                        gap: { xs: 1.5, sm: 2, md: 2.5 },
                        flexWrap: "wrap",
                        width: "100%",
                        justifyContent: { xs: "space-between", sm: "flex-start" }
                    }}
                >
                    {budgetStats.map((stat, index) => (
                        <StatCard key={index} stat={stat} />
                    ))}
                </Box>
            </Box>



            {/* Form */}
            <BudgetForm
                users={users}
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                handleAdd={handleAdd}
                loading={loading}
            />

            {/* Table */}
            <BudgetTable
                limit={limit}
                setLimit={setLimit}
                budgets={budgets}
                loading={loading}
                meta={meta}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                filterMonth={filterMonth}
                setFilterMonth={setFilterMonth}
                filterYear={filterYear}
                setFilterYear={setFilterYear}
                getMonthByNumber={getMonthByNumber}
                handleOpen={handleOpen}
            />

            {/* Edit Modal */}
            <EditBudgetModal
                open={open}
                handleClose={handleClose}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
            />
        </Box>
    );
};

export default Budgeting;
