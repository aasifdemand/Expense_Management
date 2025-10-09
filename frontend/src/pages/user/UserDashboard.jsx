import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useExpenses } from "../../hooks/useExpenses";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TabButtonsWithReport from "../../components/general/TabButtonsWithReport";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import DashboardBudgetChart from "../../components/admin/dashboard/DashboardBudgetChart";
import { useDispatch, useSelector } from "react-redux";
import { fetchReimbursementsForUser } from "../../store/reimbursementSlice";
import { fetchExpensesForUser } from "../../store/expenseSlice";
import { fetchUserBudgets } from "../../store/budgetSlice";
import StatCard from "../../components/general/StatCard";



// Stats Cards Section
const StatsCardsSection = ({ budgetStats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "flex-start",
        }}
      >
        {budgetStats.map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: isMobile ? "1 1 100%" : { sm: "1 1 calc(50% - 10px)", md: "1 1 0" },
              minWidth: isMobile ? "100%" : "240px",
            }}
          >
            <StatCard stat={stat} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state?.auth);
  const [activeTab, setActiveTab] = useState("budget");
  const { userReimbursements } = useSelector((state) => state?.reimbursement);

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
    year,
  } = useBudgeting();

  const {
    allExpenses,
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
    if (!user?._id) return
    if (user && user?._id) {
      dispatch(fetchExpensesForUser({ userId: user?._id, page: 1, limit: 20 }));
      dispatch(fetchReimbursementsForUser({
        id: user?._id,
      }))
      dispatch(fetchUserBudgets({
        userId: user._id
      }))

    }
  }, [dispatch, user])




  // Budget Stats Calculations
  const totalAllocated = Number(allBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0))
  const totalExpenses = allExpenses?.reduce((acc, e) => acc + Number(e?.amount || 0), 0) || 0;
  const totalPendinReimbursed = userReimbursements && userReimbursements?.filter(item => !item?.isReimbursed).reduce((acc, b) => acc + Number(b.amount), 0)
  const totalReimbursed = userReimbursements && userReimbursements?.filter(item => item?.isReimbursed).reduce((acc, b) => acc + Number(b.amount), 0)


  const budgetStats = [
    {
      title: "Total Allocated",
      value: `₹${totalAllocated || 0}`,
      icon: <AccountBalanceIcon />,
      color: "#3b82f6",
      subtitle: "Total budget allocation",
    },
    {
      title: "Total Expenses",
      value: `₹${totalExpenses || 0}`,
      icon: <MonetizationOnIcon />,
      color: "#f63b3bff",
      subtitle: "Total expenses amount",
    },
    {
      title: "Total Pending Reimbursement",
      value: `₹${totalPendinReimbursed || 0}`,
      icon: <CreditCardIcon />,
      color: "#10b981",
      subtitle: "Available funds",
    },
    {
      title: "Total Reimbursement recieved",
      value: `₹${totalReimbursed || 0}`,
      icon: <CreditCardIcon />,
      color: "#10b981",
      subtitle: "Available funds",
    },
  ];

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Responsive Stats Cards */}
      <StatsCardsSection budgetStats={budgetStats} />

      {/* Dashboard Chart */}
      <Box sx={{ width: "100%", mb: { xs: 3, sm: 4 }, overflowX: "auto" }}>
        <DashboardBudgetChart
          budgets={allExpenses}
          theme={theme}
          year={year}
          selectedMonth={budgetSelectedMonth}
          setSelectedMonth={setBudgetSelectedMonth}
        />
      </Box>

      {/* Tabs Section */}
      <Box sx={{ my: { xs: 2, sm: 3 } }}>
        <TabButtonsWithReport
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          budgets={allBudgets}
          expenses={allExpenses}
        />
      </Box>

      {/* Tables Section */}
      <Box sx={{ mt: { xs: 2, sm: 3 }, overflowX: "auto" }}>
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
            expenses={allExpenses}
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
