import React from "react";
import { Box, Typography, Card, CardContent, alpha } from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";

// MUI Icons (same style as AdminDashboard)
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";

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

  const StatCard = ({ stat }) => (
    <Card
      sx={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        height: { xs: "130px", sm: "140px", md: "150px" },
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
          height: "4px",
          background: stat.bgGradient,
          boxShadow: `0 2px 8px ${alpha(stat.color, 0.3)}`,
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Section - Icon + Value */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.8, sm: 1.2, md: 1.5, lg: 2 },
          }}
        >
          <Box
            sx={{
              backgroundColor: alpha(stat.color, 0.1),
              borderRadius: "12px",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: stat.color,
              minWidth: { xs: "40px", sm: "44px", md: "48px", lg: "52px" },
              minHeight: { xs: "40px", sm: "44px", md: "48px", lg: "52px" },
            }}
          >
            {stat.icon}
          </Box>
          <Typography
            variant="h4"
            sx={{
              color: "#000000",
              fontWeight: 700,
              fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.3rem", lg: "1.5rem" },
              lineHeight: 1.1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {stat.value}
          </Typography>
        </Box>

        {/* Bottom Section - Title + Subtitle */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.85rem", lg: "0.95rem" },
              mt: 1,
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
              fontSize: { xs: "0.62rem", sm: "0.68rem", md: "0.72rem", lg: "0.78rem" },
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              opacity: 0.8,
            }}
          >
            {stat.subtitle}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: "100vh",
      }}
    >
      {/* Budget Stats Section */}
      <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3, lg: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
            width: "100%",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {expenseStats?.map((stat, index) => (
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