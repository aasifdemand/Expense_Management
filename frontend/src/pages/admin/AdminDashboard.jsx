import React from "react";
import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import BudgetStats from "../../components/admin/budgeting/BudgetStats";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseStats from "../../components/admin/expense/ExpenseStats";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DashboardBudgetChart from "../../components/admin/dashboard/DashboardBudgetChart";
import DailyExpenseChart from "../../components/admin/expense/ExpenseChart";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import { useState } from "react";
import TabButtonsWithReport from "../../components/general/TabButtonsWithReport";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import DashboardExpensesChart from "../../components/admin/dashboard/DashboardExpensesChart";

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:400px)");

  const [activeTab, setActiveTab] = useState("budget");

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
    selectedMonth: expenseSelectedMonth,
    setSelectedMonth: setExpenseSelectedMonth,
  } = useExpenses();

  // Budget Stats
  const totalAllocated = allBudgets?.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0) || 0;
  const totalSpent = allBudgets?.reduce((acc, b) => acc + (b.spentAmount || 0), 0) || 0;
  const remainingBalance = totalAllocated - totalSpent;
  const budgetUsagePercentage = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

  const budgetStats = [
    {
      title: "Total Allocated",
      value: `₹${totalAllocated.toLocaleString()}`,
      icon: <AccountBalanceIcon />,
      color: "#4361ee",
      subtitle: "Total budget allocation"
    },
    {
      title: "Total Spent",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: <TrendingUpIcon />,
      color: "#ef476f",
      subtitle: `${budgetUsagePercentage}% of budget used`
    },
    {
      title: "Remaining Balance",
      value: `₹${remainingBalance.toLocaleString()}`,
      icon: <CreditCardIcon />,
      color: "#06d6a0",
      subtitle: "Available funds"
    },
    {
      title: "Budget Allocations",
      value: allBudgets?.length || 0,
      icon: <AttachMoneyIcon />,
      color: "#ff9e00",
      subtitle: "Total allocations"
    },
  ];

  // Expense Stats
  const totalExpenses = allExpenses?.reduce((acc, e) => acc + Number(e?.amount || 0), 0) || 0;
  const totalReimbursed = allExpenses?.reduce((acc, e) => acc + (e?.isReimbursed ? Number(e.amount) : 0), 0) || 0;
  const totalPendingReimbursement = totalExpenses - totalReimbursed;
  const reimbursementPercentage = totalExpenses > 0 ? ((totalReimbursed / totalExpenses) * 100).toFixed(1) : 0;

  const expenseStats = [
    {
      title: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString()}`,
      color: "#4361ee",
      icon: <MonetizationOnIcon />,
      subtitle: "Total expenses amount"
    },
    {
      title: "Reimbursed",
      value: `₹${totalReimbursed.toLocaleString()}`,
      color: "#06d6a0",
      icon: <ReceiptIcon />,
      subtitle: `${reimbursementPercentage}% reimbursed`
    },
    {
      title: "Pending Reimbursement",
      value: `₹${totalPendingReimbursement.toLocaleString()}`,
      color: "#ef476f",
      icon: <PendingActionsIcon />,
      subtitle: "Awaiting reimbursement"
    },
    {
      title: "Expense Count",
      value: allExpenses?.length || 0,
      color: "#7209b7",
      icon: <AttachMoneyIcon />,
      subtitle: "Total expenses"
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Budget Stats Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: "text.primary"
          }}
        >
          Budget Overview
        </Typography>
        <BudgetStats
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
          stats={budgetStats}
        />
      </Box>

      {/* Expense Stats Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: "text.primary"
          }}
        >
          Expense Overview
        </Typography>
        <ExpenseStats
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
          stats={expenseStats}
        />
      </Box>

      {/* Charts aligned horizontally */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mt: 4,
          mb: 4
        }}
      >
        <Box sx={{ flex: 1 }}>
          <DashboardBudgetChart
            budgets={allBudgets}
            theme={theme}
            year={year}
            selectedMonth={budgetSelectedMonth}
            setSelectedMonth={setBudgetSelectedMonth}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <DashboardExpensesChart
            expenses={allExpenses}
            theme={theme}
            year={year}
            selectedMonth={expenseSelectedMonth}
            setSelectedMonth={setExpenseSelectedMonth}
          />
        </Box>
      </Box>

      {/* Tab Section */}
      <Box sx={{ mb: 3 }}>
        <TabButtonsWithReport
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          budgets={allBudgets}
          expenses={allExpenses}
        />
      </Box>

      {/* Tables Section */}
      <Box sx={{ mt: 3 }}>
        {activeTab === "budget" && (
          <>
            <BudgetTable
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