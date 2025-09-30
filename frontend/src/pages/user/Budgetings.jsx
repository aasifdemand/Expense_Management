import React from 'react'
import { useBudgeting } from '../../hooks/useBudgeting.js'
import { useTheme } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import BudgetTable from '../../components/admin/budgeting/BudgetTable.jsx';
import EditBudgetModal from '../../components/admin/budgeting/BudgetEditModal.jsx';
import BudgetStats from '../../components/admin/budgeting/BudgetStats.jsx';
import BudgetChart from '../../components/admin/budgeting/BudgetChart.jsx';

const Budgetings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallMobile = useMediaQuery("(max-width:400px)");

  const {
    allBudgets,
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
    selectedMonth, setSelectedMonth, year
  } = useBudgeting()


  const totalAllocated = allBudgets?.reduce(
    (acc, b) => acc + (b.allocatedAmount || 0),
    0
  );

  const totalSpent = allBudgets?.reduce(
    (acc, b) => acc + (b.spentAmount || 0),
    0
  );

  const remainingBalance = totalAllocated - totalSpent;
  const budgetUsagePercentage =
    totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;


  const stats = [
    {
      title: "Total Allocated",
      value: `₹${totalAllocated.toLocaleString()}`,
      icon: "💰",
      color: "#4361ee",
      subtitle: "Monthly budget allocation"
    },
    {
      title: "Total Spent",
      value: `₹${totalSpent.toLocaleString()}`,
      icon: "💳",
      color: "#ef476f",
      subtitle: `${budgetUsagePercentage}% of budget used`
    },
    {
      title: "Remaining Balance",
      value: `₹${remainingBalance.toLocaleString()}`,
      icon: "📈",
      color: "#06d6a0",
      subtitle: "Available funds"
    },
    {
      title: "Allocations This Month",
      value: allBudgets?.length || 0,
      icon: "📊",
      color: "#ffd166",
      subtitle: "Current month allocations"
    },
  ];
  return (
    <div>
      <BudgetStats
        stats={stats}
        isMobile={isMobile}
        isSmallMobile={isSmallMobile}
      />

      <BudgetChart
        theme={theme}
        budgets={allBudgets}
        selectedMonth={selectedMonth}
        year={year}
        setSelectedMonth={setSelectedMonth}
      />

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
    </div>
  )
}

export default Budgetings
