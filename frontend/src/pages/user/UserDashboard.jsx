import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useExpenses } from "../../hooks/useExpenses";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TimelineIcon from "@mui/icons-material/Timeline";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TabButtonsWithReport from "../../components/general/TabButtonsWithReport";
import BudgetTable from "../../components/admin/budgeting/BudgetTable";
import EditBudgetModal from "../../components/admin/budgeting/BudgetEditModal";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchReimbursementsForUser } from "../../store/reimbursementSlice";
import { fetchExpensesForUser } from "../../store/expenseSlice";
import { fetchUserBudgets } from "../../store/budgetSlice";
import StatCard from "../../components/general/StatCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Stats Cards Section
const StatsCardsSection = ({ budgetStats }) => {
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
              flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 10px)", md: "1 1 0" },
              minWidth: { xs: "100%", sm: "240px" },
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
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state?.auth);
  const [activeTab, setActiveTab] = useState("budget");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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
    if (!user?._id) return;
    dispatch(fetchExpensesForUser({ userId: user._id, page: 1, limit: 20 }));
    dispatch(fetchReimbursementsForUser({ id: user._id }));
    dispatch(fetchUserBudgets({ userId: user._id }));
  }, [dispatch, user]);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  // ✅ FIXED: Now using createdAt for date grouping
  const getDailyAreaChartData = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      dailyData.push({
        day: day.toString(),
        date: `${day}/${selectedMonth + 1}/${selectedYear}`,
        fromAllocation: 0,
        fromReimbursement: 0,
        totalAmount: 0,
      });
    }

    const monthlyExpenses =
      allExpenses?.filter((expense) => {
        if (!expense?.createdAt) return false;
        const expenseDate = parseDate(expense.createdAt);
        if (!expenseDate) return false;
        return (
          expenseDate.getMonth() === selectedMonth &&
          expenseDate.getFullYear() === selectedYear
        );
      }) || [];

    monthlyExpenses.forEach((expense) => {
      const expenseDate = parseDate(expense.createdAt);
      if (!expenseDate) return;
      const day = expenseDate.getDate();
      if (dailyData[day - 1]) {
        const fromAllocation = Number(expense.fromAllocation || 0);
        const fromReimbursement = Number(expense.fromReimbursement || 0);
        const totalAmount = Number(expense.amount || 0);
        dailyData[day - 1].fromAllocation += fromAllocation;
        dailyData[day - 1].fromReimbursement += fromReimbursement;
        dailyData[day - 1].totalAmount += totalAmount;
      }
    });

    return dailyData;
  };

  const dailyAreaChartData = getDailyAreaChartData();

  const totalAllocated = Number(
    allBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0)
  );
  const totalExpenses =
    allExpenses?.reduce((acc, e) => acc + Number(e?.amount || 0), 0) || 0;
  const totalPendinReimbursed =
    userReimbursements &&
    userReimbursements
      ?.filter((item) => !item?.isReimbursed)
      .reduce((acc, b) => acc + Number(b.amount), 0);
  const totalReimbursed =
    userReimbursements &&
    userReimbursements
      ?.filter((item) => item?.isReimbursed)
      .reduce((acc, b) => acc + Number(b.amount), 0);

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
      color: "#f63b3b",
      subtitle: "Total expenses amount",
    },
    {
      title: "Pending Reimbursement",
      value: `₹${totalPendinReimbursed || 0}`,
      icon: <CreditCardIcon />,
      color: "#f59e0b",
      subtitle: "Awaiting processing",
    },
    {
      title: "Reimbursement Received",
      value: `₹${totalReimbursed || 0}`,
      icon: <TimelineIcon />,
      color: "#b96a10ff",
      subtitle: "Available funds",
    },
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <StatsCardsSection budgetStats={budgetStats} />

      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Expense Overview - {months[selectedMonth]} {selectedYear}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="Month"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map((month, index) => (
                      <MenuItem key={month} value={index}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* ✅ Chart without theme.palette */}
            <Box sx={{ width: "100%", height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyAreaChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fill: "#555" }} />
                  <YAxis tick={{ fill: "#555" }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(v, n) => {
                      const labelMap = {
                        fromAllocation: "From Allocation",
                        fromReimbursement: "From Reimbursement",
                        totalAmount: "Total Amount",
                      };
                      return [`₹${v}`, labelMap[n] || n];
                    }}
                    labelFormatter={(label, payload) =>
                      payload && payload[0]
                        ? `Date: ${payload[0].payload.date}`
                        : `Day: ${label}`
                    }
                  />
                  <Area type="monotone" dataKey="fromAllocation" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="fromReimbursement" stroke="#f59e0b" fill="#fde68a" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="totalAmount" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 2, flexWrap: "wrap" }}>
              <LegendItem color="#3b82f6" label="From Allocation" />
              <LegendItem color="#f59e0b" label="From Reimbursement" />
              <LegendItem color="#10b981" label="Total Amount" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ my: { xs: 2, sm: 3 } }}>
        <TabButtonsWithReport
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          budgets={allBudgets}
          expenses={allExpenses}
        />
      </Box>

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

// Simple legend component
const LegendItem = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ width: 12, height: 12, backgroundColor: color, borderRadius: 1 }} />
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default Dashboard;
