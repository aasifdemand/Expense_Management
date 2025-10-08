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
    const dispatch = useDispatch();

    const {
        allBudgets,
        budgets,
        loading,
        meta,
        users,
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
    } = useBudgeting();

    // Budget Stats Calculations
    const totalAllocated =
        allBudgets?.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0) || 0;

    const totalSpent =
        allBudgets?.reduce((acc, b) => acc + (b.spentAmount || 0), 0) || 0;

    const remainingBalance = totalAllocated - totalSpent;


    // Budget Stats Cards with improved color scheme
    const budgetStats = [
        {
            title: "Total Allocated",
            value: `₹${totalAllocated.toLocaleString()}`,
            icon: <AccountBalanceIcon />,
            color: "#3b82f6", // Blue
            subtitle: "Total budget allocation",
            trendColor: "#10b981",
            bgGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
        },
        {
            title: "Total Expenses",
            value: `₹${totalSpent.toLocaleString()}`,
            icon: <TrendingUpIcon />,
            color: "#ef4444", // Red
            subtitle: `Total budget used`,
            trendColor: "#ef4444",
            bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
        },
        {
            title: "Remaining Balance",
            value: `₹${remainingBalance.toLocaleString()}`,
            icon: <CreditCardIcon />,
            color: "#10b981", // Green
            subtitle: "Available funds",
            trendColor: "#10b981",
            bgGradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)"
        },
        {
            title: "Budget Allocations",
            value: allBudgets?.length || 0,
            icon: <AttachMoneyIcon />,
            color: "#f59e0b", // Amber
            subtitle: "Total allocations",
            trendColor: "#10b981",
            bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
        }
    ];

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Enhanced StatCard Component with black font color and perfect responsiveness
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
                    },
                    "& .stat-icon-container": {
                        transform: "scale(1.05)",
                        backgroundColor: alpha(stat.color, 0.15),
                        borderColor: alpha(stat.color, 0.3)
                    }
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: stat.bgGradient,
                    boxShadow: `0 2px 8px ${alpha(stat.color, 0.3)}`
                }
            }}
        >
            <CardContent
                sx={{
                    p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    '&:last-child': {
                        pb: { xs: 1.5, sm: 2, md: 2.5, lg: 3 }
                    }
                }}
            >
                {/* Top Section */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: { xs: 1, sm: 1.2, md: 1.5, lg: 2 },
                        gap: 1
                    }}
                >
                    {/* Icon + Value */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 0.8, sm: 1.2, md: 1.5, lg: 2 },
                            flex: 1,
                            minWidth: 0
                        }}
                    >
                        <Box
                            className="stat-icon-container"
                            sx={{
                                backgroundColor: alpha(stat.color, 0.1),
                                borderRadius: { xs: "10px", sm: "11px", md: "12px", lg: "14px" },
                                p: { xs: 0.8, sm: 1, md: 1.2, lg: 1.5 },
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `2px solid ${alpha(stat.color, 0.2)}`,
                                flexShrink: 0,
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                position: "relative",
                                minWidth: { xs: "40px", sm: "44px", md: "48px", lg: "52px" },
                                minHeight: { xs: "40px", sm: "44px", md: "48px", lg: "52px" },
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: "inherit",
                                    background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                                    opacity: 0,
                                    transition: "opacity 0.3s ease"
                                },
                                "&:hover::after": {
                                    opacity: 1
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    color: stat.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    "& svg": {
                                        fontSize: {
                                            xs: "1.2rem",
                                            sm: "1.3rem",
                                            md: "1.5rem",
                                            lg: "1.7rem"
                                        },
                                        filter: `drop-shadow(0 1px 2px ${alpha(stat.color, 0.2)})`
                                    }
                                }}
                            >
                                {stat.icon}
                            </Box>
                        </Box>
                        <Typography
                            variant="h4"
                            sx={{
                                color: "#000000", // Pure black for better readability
                                fontWeight: 700,
                                fontSize: {
                                    xs: "0.95rem",
                                    sm: "1.1rem",
                                    md: "1.3rem",
                                    lg: "1.5rem"
                                },
                                lineHeight: 1.1,
                                wordBreak: "break-word",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                letterSpacing: "-0.01em",
                                textShadow: "none"
                            }}
                        >
                            {stat.value}
                        </Typography>
                    </Box>
                </Box>

                {/* Bottom Section */}
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "#1e293b",
                            fontWeight: 700,
                            fontSize: {
                                xs: "0.72rem",
                                sm: "0.8rem",
                                md: "0.85rem",
                                lg: "0.95rem"
                            },
                            lineHeight: 1.2,
                            mb: { xs: 0.2, sm: 0.3, md: 0.4, lg: 0.5 },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            letterSpacing: "-0.005em"
                        }}
                    >
                        {stat.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6b7280",
                            fontSize: {
                                xs: "0.62rem",
                                sm: "0.68rem",
                                md: "0.72rem",
                                lg: "0.78rem"
                            },
                            fontWeight: 600,
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            opacity: 0.8
                        }}
                    >
                        {stat.subtitle}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{
            p: {
                xs: 1,
                sm: 1.5,
                md: 2,
                lg: 3
            },
            width: "100%",
            maxWidth: "100%",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            minHeight: "100vh",
            overflowX: "hidden"
        }}>
            {/* Stats Section */}
            <Box sx={{
                mb: {
                    xs: 2,
                    sm: 2.5,
                    md: 3,
                    lg: 4
                }
            }}>
                <Box
                    sx={{
                        display: "flex",
                        gap: {
                            xs: 1,
                            sm: 1.2,
                            md: 1.5,
                            lg: 2
                        },
                        flexWrap: "wrap",
                        width: "100%",
                        justifyContent: {
                            xs: "space-between",
                            sm: "flex-start"
                        }
                    }}
                >
                    {budgetStats.map((stat, index) => (
                        <StatCard key={index} stat={stat} />
                    ))}
                </Box>
            </Box>

            {/* Form */}
            <Box sx={{
                mb: {
                    xs: 2,
                    sm: 2.5,
                    md: 3
                }
            }}>
                <BudgetForm
                    users={users}
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    loading={loading}
                />
            </Box>

            {/* Table */}
            <Box>
                <BudgetTable
                    showPagination
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
            </Box>

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