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

  // ✅ Reuse StatCard from AdminDashboard (exact same design)
  const StatCard = ({ stat }) => (
    <Card
      sx={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        height: { xs: "130px", sm: "140px", md: "150px" },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        flex: 1,
        minWidth: { xs: "calc(50% - 10px)", sm: "200px", md: "240px" },
        maxWidth: { xs: "calc(50% - 10px)", sm: "none" },
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
          background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(
            stat.color,
            0.7
          )} 100%)`,
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Section - Icon, Amount and Trend */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          {/* Left Side - Icon and Amount */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                backgroundColor: alpha(stat.color, 0.1),
                borderRadius: { xs: "10px", sm: "12px" },
                p: { xs: 1, sm: 1.5 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                flexShrink: 0,
              }}
            >
              {React.cloneElement(stat.icon, {
                sx: {
                  color: stat.color,
                  fontSize: { xs: 20, sm: 24 },
                },
              })}
            </Box>
            <Typography
              variant="h4"
              sx={{
                color: "#1e293b",
                fontWeight: 700,
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.4rem",
                  md: "1.6rem",
                  lg: "1.8rem",
                },
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

        {/* Bottom Section - Title and Subtitle */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              lineHeight: 1.2,
              mb: 0.5,
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
              fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
              fontWeight: 600,
              lineHeight: 1.2,
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
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: "100vh",
      }}
    >
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1.5, sm: 2, md: 2.5 },
            flexWrap: "wrap",
            width: "100%",
            justifyContent: { xs: "space-between", sm: "flex-start" },
          }}
        >
          {expenseStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
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