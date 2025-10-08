import React, { useEffect } from "react";
import { Box, Typography, useTheme, Card, CardContent, alpha } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useExpenses } from "../../hooks/useExpenses";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DashboardBudgetChart from "../../components/admin/dashboard/DashboardBudgetChart";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import { useState } from "react";
import TabButtonsWithReport from "../../components/general/TabButtonsWithReport";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchBudgets } from "../../store/budgetSlice";
import { fetchExpenses } from "../../store/expenseSlice";
import { fetchReimbursements } from "../../store/reimbursementSlice";

const AdminDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("budget");
  const { users } = useSelector((state) => state?.auth)
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
    // selectedMonth: expenseSelectedMonth,
    setSelectedMonth: setExpenseSelectedMonth,
  } = useExpenses();

  const { reimbursements } = useSelector((state) => state?.reimbursement)


  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false }));
    dispatch(fetchExpenses({ page: 1, limit: 20 }));
    dispatch(fetchReimbursements())
  }, [dispatch]);

  const totalPendingReimbursed = reimbursements
    ?.filter(item => !item?.isReimbursed)
    .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;
  const totalReimbursed = reimbursements
    ?.filter(item => item?.isReimbursed)
    .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;

  // console.log("All expenses: ", allExpenses);

  // Budget Stats Calculations
  const totalExpenses = allBudgets?.reduce((acc, b) => acc + Number(b?.spentAmount), 0); // 153,000
  const totalAllocated = allBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0)


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
      title: "Total Pending Reimbursement",
      value: `₹${totalPendingReimbursed.toLocaleString()}`,
      icon: <CreditCardIcon />,
      color: "#10b981",
      subtitle: "Available funds",
      trend: "+15.7%",
      trendColor: "#10b981"
    },
    {
      title: "Total  Reimbursed",
      value: `₹${totalReimbursed.toLocaleString()}`,
      icon: <CreditCardIcon />,
      color: "#10b981",
      subtitle: "Available funds",
      trend: "+15.7%",
      trendColor: "#10b981"
    },
    // {
    //   title: "Budget Allocations",
    //   value: allBudgets?.length || 0,
    //   icon: <AttachMoneyIcon />,
    //   color: "#f59e0b",
    //   subtitle: "Total allocations",
    //   trend: "+5.2%",
    //   trendColor: "#10b981"
    // },
  ];



  // Enhanced Responsive Stats Card Component
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

  return (
    <Box sx={{
      p: { xs: 1.5, sm: 2, md: 3 },
      minHeight: "100vh",
      // backgroundColor: "#f8fafc"
    }}>
      {/* Budget Stats Section */}
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

      {/* Expense Stats Section */}
      {/* <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          flexWrap: 'wrap',
          width: '100%',
          justifyContent: { xs: 'space-between', sm: 'flex-start' }
        }}>
          {expenseStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </Box>
      </Box> */}

      {/* Charts Section */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 4 }
          }}
        >
          {/* Budget Chart */}
          <Box sx={{
            flex: 1,
            minHeight: { xs: 350, sm: 400 },
            width: '100%'
          }}>
            <Card sx={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              height: "100%",
              width: '100%'
            }}>
              <CardContent sx={{
                p: { xs: 2, sm: 3 },
                height: '100%'
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: { xs: "1.1rem", sm: "1.3rem" }
                  }}
                >
                  Budget Distribution
                </Typography>
                <DashboardBudgetChart

                  users={users}
                  budgets={allExpenses}
                  theme={theme}
                  year={year}
                  selectedMonth={budgetSelectedMonth}
                  setSelectedMonth={setBudgetSelectedMonth}
                />
              </CardContent>
            </Card>
          </Box>


        </Box>
      </Box>

      {/* Tab Section */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <TabButtonsWithReport
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          budgets={allBudgets}
          expenses={allExpenses}
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