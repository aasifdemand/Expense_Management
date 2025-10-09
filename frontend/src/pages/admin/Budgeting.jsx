import { Box } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAllUsers } from "../../store/authSlice";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SavingsIcon from "@mui/icons-material/Savings";
import GroupsIcon from "@mui/icons-material/Groups";
import BudgetForm from "../../components/admin/budgeting/BudgetForm";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import StatCard from "../../components/general/StatCard";

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

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Budget Stats Calculations
    const totalAllocated =
        allBudgets?.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0) || 0;
    const totalSpent =
        allBudgets?.reduce((acc, b) => acc + (b.spentAmount || 0), 0) || 0;
    const remainingBalance = totalAllocated - totalSpent;

    // Budget Stats Cards
    const budgetStats = [
        {
            title: "Total Allocated",
            value: `₹${totalAllocated.toLocaleString()}`,
            icon: <AccountBalanceIcon />,
            color: "#3b82f6",
            subtitle: "Total budget allocation",
            bgGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        },
        {
            title: "Total Expenses",
            value: `₹${totalSpent.toLocaleString()}`,

            icon: <MonetizationOnIcon />,
            color: "#ef4444", // Red
            subtitle: `Total budget used`,
            trendColor: "#ef4444",
            bgGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
        },
        {
            title: "Remaining Balance",
            value: `₹${remainingBalance.toLocaleString()}`,
            icon: <SavingsIcon />,
            color: "#10b981", // Green
            subtitle: "Available funds",
            bgGradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
        },
        {
            title: "Budget Allocations",
            value: allBudgets?.length || 0,
            icon: <GroupsIcon />,
            color: "#f59e0b", // Amber
            subtitle: "Total allocations",
            bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        },
    ];



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
                        flexWrap: "wrap",
                        gap: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
                        width: "100%",
                        justifyContent: { xs: "center", sm: "flex-start" },
                    }}
                >
                    {budgetStats?.map((stat, index) => (
                        <Box
                            key={index}
                            sx={{
                                flexGrow: 1,
                                flexBasis: { xs: "100%", sm: "48%", md: "23%" },
                            }}
                        >
                            <StatCard stat={stat} />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Budget Form */}
            <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                <BudgetForm
                    users={users}
                    formData={formData}
                    setFormData={setFormData}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    loading={loading}
                />
            </Box>

            {/* Budget Table */}
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

            {/* Edit Budget Modal */}
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
