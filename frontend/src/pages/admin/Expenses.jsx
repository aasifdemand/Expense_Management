import { Box } from "@mui/material";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseTable from "../../components/admin/expense/ExpenseTable";





const Expenses = () => {

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
    limit, handleSubmit } = useExpenses();

  return (
    <Box>
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