import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, Card, CardContent } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useExpenses } from "../../hooks/useExpenses";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DashboardBudgetChart from "../../components/admin/dashboard/DashboardBudgetChart";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import TabButtonsWithReport from "../../components/general/TabButtonsWithReport";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchBudgets } from "../../store/budgetSlice";
import { fetchExpenses } from "../../store/expenseSlice";
import { fetchReimbursements } from "../../store/reimbursementSlice";
import BusinessIcon from "@mui/icons-material/Business";
import StatCard from "../../components/general/StatCard";
import { useLocation } from "../../contexts/LocationContext";

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("budget");
  const { currentLoc } = useLocation()

  const { users } = useSelector((state) => state?.auth);
  const { reimbursements } = useSelector((state) => state?.reimbursement);

  const {
    allBudgets,
    budgets,
    loading: budgetLoading,
    meta: budgetMeta,
    year,
    page: budgetPage,
    setPage: setBudgetPage,
    handleOpen: handleBudgetOpen,
    search: budgetSearch,
    setSearch: setBudgetSearch,
    filterMonth: budgetFilterMonth,
    setFilterMonth: setBudgetFilterMonth,
    filterYear: budgetFilterYear,
    setFilterYear: setBudgetFilterYear,
    getMonthByNumber: getBudgetMonthByNumber,
    setLimit: setBudgetLimit,
    limit: budgetLimit,
    selectedMonth: budgetSelectedMonth,
    setSelectedMonth: setBudgetSelectedMonth,
    formData: budgetFormData,
    handleClose: budgetHandleClose,
    handleSubmit: budgetHandleSubmit,
    handleChange: budgetHandleChange,
    open: budgetOpen
  } = useBudgeting();

  const {
    allExpenses,
    expenses,
    loading: expenseLoading,
    meta: expenseMeta,
    page: expensePage,
    setPage: setExpensePage,
    handleOpen: handleExpenseOpen,
    search: expenseSearch,
    setSearch: setExpenseSearch,
    filterMonth: expenseFilterMonth,
    setFilterMonth: setExpenseFilterMonth,
    filterYear: expenseFilterYear,
    setFilterYear: setExpenseFilterYear,
    getMonthByNumber: getExpenseMonthByNumber,
    setLimit: setExpenseLimit,
    limit: expenseLimit,
    setSelectedMonth: setExpenseSelectedMonth,
  } = useExpenses();

  useEffect(() => {
    dispatch(fetchBudgets({ location: currentLoc }));
    dispatch(fetchExpenses({ location: currentLoc }));
    dispatch(fetchReimbursements({ location: currentLoc }));
  }, [dispatch, currentLoc]);

  const totalPendingReimbursed = reimbursements
    ?.filter(item => !item?.isReimbursed)
    .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;

  const totalReimbursed = reimbursements
    ?.filter(item => item?.isReimbursed)
    .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;

  const totalExpenses = allBudgets?.reduce((acc, b) => acc + Number(b?.spentAmount), 0) + totalReimbursed;
  const totalAllocated = allBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0) || 0;

  const budgetStats = [
    {
      title: "Total Allocated",
      value: `₹${totalAllocated.toLocaleString()}`,
      icon: <AccountBalanceIcon />,
      color: "#3b82f6",
      subtitle: "Total budget allocation",
    },
    {
      title: "Total Expenses",
      value: `₹${totalExpenses}`,
      color: "#f63b3bff",
      icon: <MonetizationOnIcon />,
      subtitle: "Allocated expenses",
      trend: "-2.1%",
      trendColor: "#ef4444"
    },
    {
      title: "To Be Reimbursed",
      value: `₹${totalPendingReimbursed.toLocaleString()}`,
      icon: <CreditCardIcon />,
      color: "#10b981",
      subtitle: "Pending funds",
      trend: "+15.7%",
      trendColor: "#10b981"
    },
    {
      title: "Total Reimbursed",
      value: `₹${totalReimbursed}`,
      icon: <BusinessIcon />,
      color: "#b96a10ff",
      subtitle: "Reimbursed funds",
    },
  ];



  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, minHeight: "100vh" }}>
      {/* Budget Stats Section */}

      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1.5, sm: 2, md: 2.5 },
            width: "100%",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {budgetStats.map((stat, index) => (
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




      {/* Charts Section */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ flex: 1, minHeight: { xs: 350, sm: 400 }, width: '100%' }}>
            <DashboardBudgetChart
              users={users}
              budgets={allExpenses}
              theme={theme}
              year={year}
              selectedMonth={budgetSelectedMonth}
              setSelectedMonth={setBudgetSelectedMonth}
            />
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <TabButtonsWithReport
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          budgets={allBudgets}
          expenses={allExpenses}
        />
      </Box>

      {/* Tables */}
      <Box sx={{ mt: { xs: 2, sm: 3 } }}>
        {activeTab === "budget" && (
          <>
            <BudgetTable
              showPagination
              limit={budgetLimit}
              setLimit={setBudgetLimit}
              budgets={budgets}
              loading={budgetLoading}
              meta={budgetMeta}
              page={budgetPage}
              setPage={setBudgetPage}
              search={budgetSearch}
              setSearch={setBudgetSearch}
              filterMonth={budgetFilterMonth}
              setFilterMonth={setBudgetFilterMonth}
              filterYear={budgetFilterYear}
              setFilterYear={setBudgetFilterYear}
              getMonthByNumber={getBudgetMonthByNumber}
              handleOpen={handleBudgetOpen}
            />
            <EditBudgetModal
              open={budgetOpen}
              handleClose={budgetHandleClose}
              formData={budgetFormData}
              handleChange={budgetHandleChange}
              handleSubmit={budgetHandleSubmit}
            />
          </>
        )}
        {activeTab === "expense" && (
          <ExpenseTable
            limit={expenseLimit}
            setLimit={setExpenseLimit}
            expenses={expenses}
            loading={expenseLoading}
            meta={expenseMeta}
            page={expensePage}
            setPage={setExpensePage}
            search={expenseSearch}
            setSearch={setExpenseSearch}
            filterMonth={expenseFilterMonth}
            setFilterMonth={setExpenseFilterMonth}
            filterYear={expenseFilterYear}
            setFilterYear={setExpenseFilterYear}
            getMonthByNumber={getExpenseMonthByNumber}
            handleOpen={handleExpenseOpen}
            setSelectedMonth={setExpenseSelectedMonth}
          />
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
