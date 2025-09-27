import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import BudgetStats from "../../components/admin/budgeting/BudgetStats";
import BudgetChart from "../../components/admin/budgeting/BudgetChart";
import BudgetForm from "../../components/admin/budgeting/BudgetForm";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";

const Budgeting = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isSmallMobile = useMediaQuery("(max-width:400px)");

    const {
        budgets,
        loading,
        meta,
        users,
        year,
        currentMonth,
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
        limit
    } = useBudgeting();

    const selectedMonth = currentMonth || new Date().getMonth() + 1;

    const totalAllocated = meta?.totalAllocated || 0;
    const totalSpent = meta?.totalSpent || 0;
    const remainingBalance = totalAllocated - totalSpent;
    const budgetUsagePercentage = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

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
            value: budgets?.length || 0,
            icon: "📊",
            color: "#ffd166",
            subtitle: "Current month allocations"
        },
    ];

    return (
        <Box sx={{ p: 3, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
            <BudgetStats
                stats={stats}
                isMobile={isMobile}
                isSmallMobile={isSmallMobile}
            />

            <BudgetChart
                theme={theme}
                budgets={budgets}
                selectedMonth={selectedMonth}
                year={year}
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