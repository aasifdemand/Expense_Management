import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateExpense,
  addExpense,
  searchExpenses,
  fetchExpenses,
  fetchExpensesForUser
} from "../store/expenseSlice";
import { getMonthByNumber } from "../utils/get-month";
import { fetchBudgets } from "../store/budgetSlice";

export const useExpenses = () => {
  const dispatch = useDispatch();
  const { expenses, loading, meta, userExpenses, stats, allExpenses } = useSelector((state) => state?.expense);
  const { role } = useSelector((state) => state?.auth);
  const { users, user } = useSelector((state) => state?.auth);

  const year = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formData, setFormData] = useState({
    userId: "",
    amount: 0,
    month: currentMonth,
    year: year,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);


  const [open, setOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);





  useEffect(() => {
    const hasFilters =
      Boolean(filterMonth) || Boolean(filterYear) || debouncedSearch?.trim();

    if (role === "superadmin") {
      if (hasFilters) {
        dispatch(
          searchExpenses({
            userName: debouncedSearch || undefined,
            month: filterMonth || undefined,
            year: filterYear || undefined,
            page,
            limit,
          })
        );
      } else {
        dispatch(
          fetchExpenses({
            page,
            limit,
          })
        );
      }
    } else {
      dispatch(
        fetchExpensesForUser({
          userName: debouncedSearch || undefined,
          month: filterMonth || undefined,
          year: filterYear || undefined,
          page,
          limit,
        })
      );
    }
  }, [dispatch, page, limit, debouncedSearch, filterMonth, filterYear, role]);




  const handleOpen = (row) => {
    console.log("row: ", row);

    setSelectedExpense({
      name: user?.name,
      ...row
    });
    setFormData({
      userId: row.user?._id,
      amount: row.allocatedAmount,
      month: row.month,
      year: row.year,
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    const response = await dispatch(addExpense(formData));
    if (addExpense.fulfilled.match(response)) {
      await dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false }));
      await dispatch(fetchExpenses({ page: 1, limit: 20 }));
      setFormData({
        userId: "",
        amount: "",
        month: currentMonth,
        year: year,
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedExpense) return;

    try {
      const resultAction = await dispatch(updateExpense({ id: selectedExpense._id, updates: formData }));
      if (updateExpense.fulfilled.match(resultAction)) {
        await dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false }));
        await dispatch(fetchExpenses({ page: 1, limit: 20 }));
      } else {
        console.error("Update expense failed:", resultAction.payload || resultAction.error);
      }
      setOpen(false);
    } catch (err) {
      console.error("Unexpected error updating expense:", err);
    }
  };


  return {
    allExpenses,
    stats,
    userExpenses,
    expenses,
    loading,
    meta,
    users,
    year,
    currentMonth,
    page,
    setPage,
    setLimit,
    limit,
    formData,
    setFormData,
    open,
    handleOpen,
    handleClose,
    handleChange,
    handleAdd,
    handleSubmit,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    getMonthByNumber,
    selectedExpense,
    setSelectedExpense,
    selectedMonth,
    setSelectedMonth,
  };
};
