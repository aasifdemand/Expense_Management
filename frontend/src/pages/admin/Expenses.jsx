import { Box, Button, Tabs, Tab } from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import { useNavigate } from "react-router-dom";
import React from "react";
// Icons
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";
import StatCard from "../../components/general/StatCard";

const Expenses = () => {
  const navigate = useNavigate();

  const {
    expenses,
    adminExpenses,
    loading,
    meta,
    page,
    setPage,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    getMonthByNumber,
    setLimit,
    limit,
    handleOpen,
  } = useExpenses();

  // ===================== TABS =====================
  const [tab, setTab] = React.useState(0); // 0 = User, 1 = Admin

  const isUserTab = tab === 0;
  const isAdminTab = tab === 1;

  // ===================== STATS SOURCE =====================
  const statsSource = isUserTab ? expenses : adminExpenses;
  const safeExpenses = statsSource || [];

  // ===================== STATS =====================
  const totalExpenses = safeExpenses.reduce(
    (acc, e) => acc + Number(e.amount || 0),
    0
  );

  const salesExpenses = safeExpenses
    .filter((e) => e?.department?.name === "Sales")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const dataExpenses = safeExpenses
    .filter((e) => e?.department?.name === "Data")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const itExpenses = safeExpenses
    .filter((e) => e?.department?.name === "IT")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const officeExpenses = safeExpenses
    .filter((e) => e?.department?.name === "Office")
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  const expenseStats = [
    {
      title: "Total Expenses",
      value: `₹${totalExpenses.toLocaleString()}`,
      color: "#3b82f6",
      icon: <MonetizationOnIcon />,
      subtitle: isUserTab ? "User Expenses" : "Admin Expenses",
    },
    {
      title: "Sales",
      value: `₹${salesExpenses.toLocaleString()}`,
      color: "#10b981",
      icon: <ReceiptIcon />,
    },
    {
      title: "Data",
      value: `₹${dataExpenses.toLocaleString()}`,
      color: "#8b5cf6",
      icon: <PendingActionsIcon />,
    },
    {
      title: "IT",
      value: `₹${itExpenses.toLocaleString()}`,
      color: "#f59e0b",
      icon: <AttachMoneyIcon />,
    },
    {
      title: "Office",
      value: `₹${officeExpenses.toLocaleString()}`,
      color: "#ef4444",
      icon: <BusinessIcon />,
    },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, minHeight: "100vh" }}>
      {/* ===================== TABS ===================== */}
      <Tabs
        value={tab}
        onChange={(_, val) => {
          setTab(val);
          setPage(1); // reset pagination when switching tabs
        }}
        sx={{ mb: 3 }}
      >
        <Tab label="User Expenses" />
        <Tab label="Admin Expenses" />
      </Tabs>

      {/* ===================== STATS ===================== */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 1.5, md: 2.5 },
          }}
        >
          {expenseStats.map((stat, index) => (
            <Box key={index} sx={{ flex: 1 }}>
              <StatCard stat={stat} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* ===================== ACTION ===================== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            boxShadow: 2,
            "&:hover": { boxShadow: 4 },
          }}
          onClick={() =>
            navigate(
              isAdminTab ? "/admin/expenses/add" : "/user/expenses/add"
            )
          }
        >
          + Upload New Expense
        </Button>
      </Box>

      {/* ===================== TABLE ===================== */}
      <ExpenseTable
        expenses={isUserTab ? expenses : adminExpenses}
        loading={loading}
        meta={meta}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        getMonthByNumber={getMonthByNumber}
        handleOpen={handleOpen}
        disableFilters={isAdminTab} // 🔑 KEY
      />
    </Box>
  );
};

export default Expenses;
