import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, Card, CardContent, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useBudgeting } from "../../hooks/useBudgeting";
import { useExpenses } from "../../hooks/useExpenses";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { currentLoc } = useLocation();

  const { reimbursements } = useSelector((state) => state?.reimbursement);

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
    open: budgetOpen
  } = useBudgeting();

  const {
    allExpenses,
    adminExpenses,
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

  const totalExpenses = adminExpenses.reduce((acc, b) => acc + Number(b?.amount), 0) + allExpenses.reduce((acc, b) => acc + Number(b?.amount), 0);
  const totalAllocated = allBudgets?.reduce((acc, b) => acc + Number(b?.allocatedAmount), 0) || 0;

  // Get days in selected month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 🎯 FIXED: Simplified date parsing without timezone issues
  const parseDate = (dateString) => {
    if (!dateString) return null;

    try {
      // For ISO strings (from MongoDB), parse as UTC but treat as local date
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        // Create a new date using the UTC components but as local date
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      }

      // For simple date strings (YYYY-MM-DD)
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed in JS Date
      }

      // Fallback
      return new Date(dateString);
    } catch (error) {
      console.warn('Invalid date:', dateString, error);
      return null;
    }
  };

  // 🎯 FIXED: Date comparison function
  const isDateInSelectedMonth = (date, selectedMonth, selectedYear) => {
    if (!date) return false;

    // Use local date components
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();

    return dateMonth === selectedMonth && dateYear === selectedYear;
  };

  // 🎯 FIXED: Daily chart data preparation
  const getDailyAreaChartData = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const dailyData = [];

    // Initialize all days with 0 values
    for (let day = 1; day <= daysInMonth; day++) {
      dailyData.push({
        day: day.toString(),
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        displayDate: `${day}/${selectedMonth + 1}/${selectedYear}`,
        fromAllocation: 0,
        fromReimbursement: 0,
        totalAmount: 0
      });
    }

    // Process expenses for the selected month with proper date parsing
    const monthlyExpenses = allExpenses?.filter(expense => {
      const expenseDate = parseDate(expense.date);
      const isInMonth = isDateInSelectedMonth(expenseDate, selectedMonth, selectedYear);

      // Debug log to check date parsing
      if (isInMonth && expense.date) {
        console.log('Expense included:', {
          originalDate: expense.date,
          parsedDate: expenseDate?.toISOString(),
          day: expenseDate?.getDate(),
          amount: expense.amount
        });
      }

      return isInMonth;
    }) || [];

    console.log('Monthly expenses count:', monthlyExpenses.length); // Debug

    // Fill in expense data
    monthlyExpenses.forEach(expense => {
      const expenseDate = parseDate(expense.date);
      if (!expenseDate) return;

      const day = expenseDate.getDate();
      const dayIndex = day - 1;

      if (dailyData[dayIndex]) {
        const fromAllocation = Number(expense.fromAllocation || 0);
        const fromReimbursement = Number(expense.fromReimbursement || 0);
        const totalAmount = Number(expense.amount || 0);

        dailyData[dayIndex].fromAllocation += fromAllocation;
        dailyData[dayIndex].fromReimbursement += fromReimbursement;
        dailyData[dayIndex].totalAmount += totalAmount;
      }
    });

    // Debug: Log the final data
    console.log('Daily chart data:', dailyData);

    return dailyData;
  };

  const dailyAreaChartData = getDailyAreaChartData();

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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4, currentYear + 5, currentYear + 6];

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

      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Expense Overview - {months[selectedMonth]} {selectedYear}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Month</InputLabel>
                  <Select value={selectedMonth} label="Month" onChange={(e) => setSelectedMonth(e.target.value)}>
                    {months.map((month, index) => (
                      <MenuItem key={month} value={index}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Year</InputLabel>
                  <Select value={selectedYear} label="Year" onChange={(e) => setSelectedYear(e.target.value)}>
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyAreaChartData}>
                  <defs>
                    {/* Gradient for Allocation */}
                    <linearGradient id="colorAllocation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    {/* Gradient for Reimbursement */}
                    <linearGradient id="colorReimbursement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                    </linearGradient>
                    {/* Gradient for Total */}
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" tick={{ fill: theme.palette.text.secondary }} label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                  <YAxis tick={{ fill: theme.palette.text.secondary }} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                  <Tooltip
                    formatter={(value, name) => {
                      const formattedValue = `₹${Number(value).toLocaleString()}`;
                      const labelMap = {
                        fromAllocation: 'From Allocation',
                        fromReimbursement: 'From Reimbursement',
                        totalAmount: 'Total Amount'
                      };
                      return [formattedValue, labelMap[name] || name];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0] && payload[0].payload.displayDate) {
                        return `Date: ${payload[0].payload.displayDate}`;
                      }
                      return `Day: ${label}`;
                    }}
                  />

                  <Area type="monotone" dataKey="fromAllocation" stackId="1" stroke="#3b82f6" fill="url(#colorAllocation)" name="From Allocation" />
                  <Area type="monotone" dataKey="fromReimbursement" stackId="1" stroke="#f59e0b" fill="url(#colorReimbursement)" name="From Reimbursement" />
                  <Area type="monotone" dataKey="totalAmount" stackId="1" stroke="#10b981" fill="url(#colorTotal)" name="Total Amount" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: 1 }} />
                <Typography variant="body2" color="text.secondary">From Allocation</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#f59e0b', borderRadius: 1 }} />
                <Typography variant="body2" color="text.secondary">From Reimbursement</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: 1 }} />
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
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