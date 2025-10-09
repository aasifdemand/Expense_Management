import { Box, } from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";

// MUI Icons (same style as AdminDashboard)
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";
import StatCard from "../../components/general/StatCard";

const Expenses = () => {
  // const theme = useTheme();

  const {
    allExpenses,
    expenses,
    loading,
    meta,
    page,
    setPage,
    handleOpen,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    getMonthByNumber,
    setLimit,
    limit,
  } = useExpenses();


  console.log("expenses: ", expenses);


  // ✅ Calculations
  const totalExpenses =
    (allExpenses || []).reduce((acc, expense) => acc + Number(expense.amount), 0) || 0;



  const salesExpenses = allExpenses?.filter((sale) => sale?.department?.name === "Sales")?.reduce((acc, expense) => acc + Number(expense.amount), 0) || 0


  const dataExpenses = allExpenses?.filter((sale) => sale?.department?.name === "Data")?.reduce((acc, expense) => acc + Number(expense.amount), 0) || 0

  const itExpenses = allExpenses?.filter((sale) => sale?.department?.name === "IT")?.reduce((acc, expense) => acc + Number(expense.amount), 0) || 0

  const officeExpenses = allExpenses?.filter((sale) => sale?.department?.name === "Office")?.reduce((acc, expense) => acc + Number(expense.amount), 0) || 0

  // ✅ Stats Array with 5 cards as requested
  const expenseStats = [
    {
      title: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString()}`,
      color: "#3b82f6",
      icon: <MonetizationOnIcon />,
      subtitle: "Total expenses amount",
      trend: "-2.1%",
      trendColor: "#ef4444",
    },
    {
      title: "Sales",
      value: `₹${salesExpenses.toLocaleString()}`,
      color: "#10b981",
      icon: <ReceiptIcon />,
      subtitle: "Sales related expenses",
      trend: "+18.5%",
      trendColor: "#10b981",
    },
    {
      title: "Data",
      value: `₹${dataExpenses.toLocaleString()}`,
      color: "#8b5cf6",
      icon: <PendingActionsIcon />,
      subtitle: "Data management costs",
      trend: "+12.3%",
      trendColor: "#10b981",
    },
    {
      title: "IT",
      value: `₹${itExpenses.toLocaleString()}`,
      color: "#f59e0b",
      icon: <AttachMoneyIcon />,
      subtitle: "IT infrastructure expenses",
      trend: "+8.7%",
      trendColor: "#10b981",
    },
    {
      title: "Office Expenses",
      value: `₹${officeExpenses.toLocaleString()}`,
      color: "#ef4444",
      icon: <BusinessIcon />,
      subtitle: "Office maintenance costs",
      trend: "-5.2%",
      trendColor: "#ef4444",
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: "100vh",
      }}
    >
      <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3, lg: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // Column on mobile, row on desktop
            flexWrap: { xs: "nowrap", md: "nowrap" },
            gap: { xs: 1.5, sm: 2, md: 2, lg: 2.5 },
            width: "100%",
          }}
        >
          {expenseStats?.map((stat, index) => (
            <Box
              key={index}
              sx={{
                flex: { xs: "0 0 auto", md: "1" },
                width: { xs: "100%", md: "auto" }
              }}
            >
              <StatCard stat={stat} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Expense Table */}
      <ExpenseTable
        limit={limit}
        setLimit={setLimit}
        expenses={expenses}
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
    </Box>
  );
};

export default Expenses;