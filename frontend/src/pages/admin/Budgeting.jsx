import { Box, useTheme, } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import BudgetStats from "../../components/admin/budgeting/BudgetStats";
import BudgetChart from "../../components/admin/budgeting/BudgetChart";
import BudgetForm from "../../components/admin/budgeting/BudgetForm";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";



const Budgeting = () => {
    const theme = useTheme();
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

    const totalAllocated = meta?.totalAllocated || 0
    const totalSpent = meta?.totalSpent || 0


    // console.log("meta: ", meta);

    const stats = [
        { label: "Allocated Budget", value: `₹${totalAllocated}`, color: theme.palette.primary.main },
        { label: "Spent Budget", value: `₹${totalSpent}`, color: theme.palette.secondary.main },
        { label: "Allocations This Month", value: budgets?.length, color: theme.palette.info.main },
        { label: "Remaining Balance", value: `₹${(totalAllocated - totalSpent)}`, color: theme.palette.success.main },
    ];

    return (
        <Box sx={{ p: 3, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
            <BudgetStats stats={stats} />



            <BudgetChart theme={theme} budgets={budgets} selectedMonth={selectedMonth} year={year} />

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
