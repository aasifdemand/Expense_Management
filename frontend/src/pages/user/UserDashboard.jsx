import { Box, Card, CardContent, Grid, Typography, alpha, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useExpenses } from "../../hooks/useExpenses";

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TabButtonsWithReport from "../../components/general/TabButtonsWithReport";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import DashboardBudgetChart from "../../components/admin/dashboard/DashboardBudgetChart"


const StatCard = ({ stat }) => (
  <Card sx={{
    background: '#ffffff',
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    height: { xs: "130px", sm: "140px", md: "150px" },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    minWidth: { xs: "calc(50% - 10px)", sm: "200px", md: "240px" },
    maxWidth: { xs: "calc(50% - 10px)", sm: "none" },
    '&:hover': {
      transform: { xs: "none", sm: "translateY(-4px)" },
      boxShadow: { xs: "0 4px 20px rgba(0, 0, 0, 0.08)", sm: "0 8px 32px rgba(0, 0, 0, 0.12)" }
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.7)} 100%)`
    }
  }}>
    <CardContent sx={{
      p: { xs: 2, sm: 3 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Top Section - Icon, Amount and Trend */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: { xs: 1.5, sm: 2 }
      }}>
        {/* Left Side - Icon and Amount */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          flex: 1,
          minWidth: 0
        }}>
          <Box sx={{
            backgroundColor: alpha(stat.color, 0.1),
            borderRadius: { xs: "10px", sm: "12px" },
            p: { xs: 1, sm: 1.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${alpha(stat.color, 0.2)}`,
            flexShrink: 0
          }}>
            {React.cloneElement(stat.icon, {
              sx: {
                color: stat.color,
                fontSize: { xs: 20, sm: 24 }
              }
            })}
          </Box>
          <Typography variant="h4" sx={{
            color: "#1e293b",
            fontWeight: 700,
            fontSize: { xs: "1.1rem", sm: "1.4rem", md: "1.6rem", lg: "1.8rem" },
            lineHeight: 1.1,
            wordBreak: 'break-word',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {stat.value}
          </Typography>
        </Box>

        {/* Right Side - Trend */}
        {/* <Box sx={{
            backgroundColor: stat.trendColor === '#ef4444' ? alpha('#fef2f2', 0.8) : alpha('#f0fdf4', 0.8),
            color: stat.trendColor,
            padding: { xs: '4px 8px', sm: '6px 10px' },
            borderRadius: '12px',
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            fontWeight: 700,
            border: `1px solid ${alpha(stat.trendColor, 0.2)}`,
            flexShrink: 0,
            ml: 1
          }}>
            {stat.trend}
          </Box> */}
      </Box>

      {/* Bottom Section - Title and Subtitle */}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{
          color: "#1e293b",
          fontWeight: 700,
          fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
          lineHeight: 1.2,
          mb: 0.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {stat.title}
        </Typography>

        <Typography variant="body2" sx={{
          color: "#6b7280",
          fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
          fontWeight: 600,
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {stat.subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState("budget");

  const {
    allBudgets,
    budgets,
    loading: budgetLoading,
    meta: budgetMeta,
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
    formData: budgetFormData,
    handleClose: budgetHandleClose,
    handleSubmit: budgetHandleSubmit,
    handleChange: budgetHandleChange,
    open: budgetOpen,
    selectedMonth: budgetSelectedMonth,
    setSelectedMonth: setBudgetSelectedMonth,
    year
  } = useBudgeting();

  const {
    userExpenses,
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
    // selectedMonth: expenseSelectedMonth,
    setSelectedMonth: setExpenseSelectedMonth,
  } = useExpenses();




  // Budget Stats Calculations
  const totalAllocated = allBudgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0) || 0;
  const totalExpenses = userExpenses?.reduce((acc, e) => acc + Number(e?.amount || 0), 0) || 0;
  const totalReimbursed = userExpenses?.reduce((acc, e) => acc + Number(e?.fromReimbursement || 0), 0) || 0;

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
      value: `₹${totalExpenses.toLocaleString()}`,
      color: "#f63b3bff",
      icon: <MonetizationOnIcon />,
      subtitle: "Total expenses amount",
      trend: "-2.1%",
      trendColor: "#ef4444"
    },
    {
      title: "Total Reimbursement",
      value: `₹${totalReimbursed.toLocaleString()}`,
      icon: <CreditCardIcon />,
      color: "#10b981",
      subtitle: "Available funds",
      trend: "+15.7%",
      trendColor: "#10b981"
    },
  ];
  return (
    <Box sx={{ py: 4 }}>

      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          flexWrap: 'wrap',
          width: '100%',
          justifyContent: { xs: 'space-between', sm: 'flex-start' }
        }}>
          {budgetStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </Box>
      </Box>

      <DashboardBudgetChart


        budgets={userExpenses}
        theme={theme}
        year={year}
        selectedMonth={budgetSelectedMonth}
        setSelectedMonth={setBudgetSelectedMonth}
      />


      {/* Tab Section */}
      <Box sx={{ my: { xs: 2, sm: 3 } }}>
        <TabButtonsWithReport
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          budgets={allBudgets}
          expenses={userExpenses}
        />
      </Box>

      {/* Tables Section */}
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
            expenses={userExpenses}
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

export default Dashboard;
