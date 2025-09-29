import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import BudgetStats from "../../components/admin/budgeting/BudgetStats";
import BudgetChart from "../../components/admin/budgeting/BudgetChart";
import BudgetForm from "../../components/admin/budgeting/BudgetForm";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAllUsers } from "../../store/authSlice";

const Budgeting = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isSmallMobile = useMediaQuery("(max-width:400px)");
    const dispatch = useDispatch()
    const {
        allBudgets,
        budgets,
        loading,
        meta,
        users,
        year,
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
        setSelectedMonth, selectedMonth
    } = useBudgeting();





    const totalAllocated = allBudgets?.reduce(
        (acc, b) => acc + (b.allocatedAmount || 0),
        0
    );

    const totalSpent = allBudgets?.reduce(
        (acc, b) => acc + (b.spentAmount || 0),
        0
    );

    const remainingBalance = totalAllocated - totalSpent;
    const budgetUsagePercentage =
        totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

    // const remainingBalance = totalAllocated - totalSpent;
    // const budgetUsagePercentage = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

    const stats = [
        {
            title: "Total Allocated",
            value: `₹${totalAllocated.toLocaleString()}`,
            icon: "💰",
            color: "#4361ee",
            subtitle: "Monthly budget allocation"
        },
        {
            title: "Total Spent",
            value: `₹${totalSpent.toLocaleString()}`,
            icon: "💳",
            color: "#ef476f",
            subtitle: `${budgetUsagePercentage}% of budget used`
        },
        {
            title: "Remaining Balance",
            value: `₹${remainingBalance.toLocaleString()}`,
            icon: "📈",
            color: "#06d6a0",
            subtitle: "Available funds"
        },
        {
            title: "Allocations This Month",
            value: allBudgets?.length || 0,
            icon: "📊",
            color: "#ffd166",
            subtitle: "Current month allocations"
        },
    ];

    useEffect(() => {
        dispatch(fetchAllUsers())
    }, [dispatch])


    console.log("all budgets: ", allBudgets);

    return (
        <Box sx={{ p: 3, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
            <BudgetStats
                stats={stats}
                isMobile={isMobile}
                isSmallMobile={isSmallMobile}
            />

            <BudgetChart
                theme={theme}
                budgets={allBudgets}
                selectedMonth={selectedMonth}
                year={year}
                setSelectedMonth={setSelectedMonth}
            />

            <BudgetForm
                users={users}
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                handleAdd={handleAdd}
                loading={loading}
            />
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