import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";
import ExpenseStats from "../../components/admin/expense/ExpenseStats";





const Expenses = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:400px)");
  const {
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
    limit } = useExpenses();



  console.log("meta: ", meta);

  console.log("expenses: ", expenses);


  const totalExpenses = (expenses || []).reduce((acc, expense) => acc + Number(expense.amount), 0);
  const totalReimbursed = (expenses || [])
    .filter(item => item?.isReimbursed)
    .reduce((acc, item) => acc + Number(item.amount), 0);

  const totalPendingReimbursement = (expenses || [])
    .filter(item => !item?.isReimbursed)
    .reduce((acc, item) => acc + Number(item.amount), 0);



  const stats = [
    {
      title: "Total Expenses",
      value: totalExpenses,
      color: "#4361ee",
      icon: "💰",
    },
    {
      title: "Reimbursed",
      value: totalReimbursed,
      color: "#ef476f",
      icon: "📈",
    },
    {
      title: "Pending Reimbursement",
      value: totalPendingReimbursement,
      color: "#06d6a0",
      icon: "💳",
    },
    {
      title: "Top Department",
      value: "Marketing",
      subtitle: "₹5,000 spent",
      color: "#ffd166",
      icon: "📊",
    },
  ];

  return (
    <Box>
      <ExpenseStats stats={stats} isMobile={isMobile} isSmallMobile={isSmallMobile} />

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