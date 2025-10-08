import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, Card, CardContent, alpha } from "@mui/material";
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

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("budget");

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
    dispatch(fetchBudgets());
    dispatch(fetchExpenses());
    dispatch(fetchReimbursements());
  }, [dispatch]);

  const totalPendingReimbursed = reimbursements
    ?.filter(item => !item?.isReimbursed)
    .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;

  const totalReimbursed = reimbursements
    ?.filter(item => item?.isReimbursed)
    .reduce((acc, reimbursement) => acc + Number(reimbursement?.expense?.fromReimbursement || 0), 0) || 0;

  const totalExpenses = allBudgets?.reduce((acc, b) => acc + Number(b?.spentAmount), 0) || 0;
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
      value: `₹${totalExpenses.toLocaleString()}`,
      color: "#f63b3bff",
      icon: <MonetizationOnIcon />,
      subtitle: "Total expenses amount",
    },
    {
      title: "Total Pending Reimbursement",
      value: `₹${totalPendingReimbursed.toLocaleString()}`,
      icon: <CreditCardIcon />,
      color: "#10b981",
      subtitle: "Available funds",
    },
    {
      title: "Total Reimbursed",
      value: `₹${totalReimbursed.toLocaleString()}`,
      icon: <CreditCardIcon />,
      color: "#10b981",
      subtitle: "Available funds",
    },
  ];

  const StatCard = ({ stat }) => (
    <Card
      sx={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        height: { xs: "140px", sm: "150px", md: "160px" },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        flex: 1,
        minWidth: 0,
        maxWidth: "100%",
        "&:hover": {
          transform: { xs: "none", sm: "translateY(-4px)" },
          boxShadow: {
            xs: "0 4px 20px rgba(0, 0, 0, 0.08)",
            sm: "0 8px 32px rgba(0, 0, 0, 0.12)",
          },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.7)} 100%)`,
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.5, sm: 3 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Section - Icon and Amount */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: { xs: 2, sm: 2.5 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 44, sm: 48, md: 52 },
                height: { xs: 44, sm: 48, md: 52 },
                borderRadius: "12px",
                backgroundColor: alpha(stat.color, 0.1),
                color: stat.color,
                flexShrink: 0,
              }}
            >
              {stat.icon}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                sx={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.7rem", lg: "1.9rem" },
                  lineHeight: 1.1,
                  wordBreak: "break-word",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {stat.value}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Bottom Section - Title and Subtitle */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
              lineHeight: 1.2,
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {stat.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#6b7280",
              fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
              fontWeight: 500,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {stat.subtitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );


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
                flexBasis: { xs: "100%", sm: "48%", md: "23%" }, // full width mobile, 2 per row small, 4 per row desktop
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
            <Card sx={{ backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(226,232,240,0.8)", height: "100%", width: '100%' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                <Typography variant="h5" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 700, color: "#1e293b", fontSize: { xs: "1.1rem", sm: "1.3rem" } }}>
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
