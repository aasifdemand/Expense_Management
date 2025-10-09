
import { useBudgeting } from '../../hooks/useBudgeting.js'
import BudgetTable from '../../components/admin/budgeting/BudgetTable.jsx';
import EditBudgetModal from '../../components/admin/budgeting/BudgetEditModal.jsx';
import { Box } from '@mui/material';


const Budgetings = () => {


  const {

    budgets,
    loading,
    meta,
    page,
    setPage,
    formData,
    open,
    handleOpen,
    handleClose,
    handleChange,
    handleSubmit,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    getMonthByNumber,
    setLimit,
    limit,

  } = useBudgeting()







  return (
    <Box sx={{ margin: { xs: 1, sm: 1, md: 4 } }}>

      <BudgetTable
        limit={limit}
        setLimit={setLimit}
        budgets={budgets}
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

      <EditBudgetModal
        open={open}
        handleClose={handleClose}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </Box>
  )
}

export default Budgetings
