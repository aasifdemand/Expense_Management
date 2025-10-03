import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateExpense,
  addExpense,
  searchExpenses,
  fetchExpenses,
  fetchExpensesForUser,
} from "../store/expenseSlice";
import { getMonthByNumber } from "../utils/get-month";
import { fetchBudgets } from "../store/budgetSlice";
import {
  fetchDepartments,
  fetchSubDepartments,
} from "../store/departmentSlice";

export const useExpenses = () => {
  const dispatch = useDispatch();
  const { expenses, userExpenses, loading, meta, stats, allExpenses } = useSelector(
    (state) => state.expense
  );
  const { role, user, users } = useSelector((state) => state.auth);
  const { departments, subDepartments } = useSelector(
    (state) => state.department
  );

  const year = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formData, setFormData] = useState({
    userId: "",
    amount: 0,
    month: currentMonth,
    year,
    department: "",
    subDepartment: "",
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [open, setOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [currentDepartment, setCurrentDepartment] = useState(null); // null = "All Departments"
  const [currentSubDepartment, setCurrentSubDepartment] = useState(null); // null = "All SubDepartments"

  // Fetch departments
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Fetch subDepartments when department changes
  useEffect(() => {
    if (currentDepartment?._id) {
      dispatch(fetchSubDepartments(currentDepartment._id));
      setCurrentSubDepartment(null);
    }
  }, [currentDepartment, dispatch]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch expenses with filters
  useEffect(() => {
    const filters = {};
    if (debouncedSearch?.trim()) filters.userName = debouncedSearch;
    if (filterMonth) filters.month = filterMonth;
    if (filterYear) filters.year = filterYear;
    if (currentDepartment?._id) filters.department = currentDepartment._id;
    if (currentSubDepartment?._id) filters.subDepartment = currentSubDepartment._id;

    const hasFilters = Object.keys(filters).length > 0;

    if (role === "superadmin") {
      if (hasFilters) {
        dispatch(searchExpenses({ ...filters, page, limit }));
      } else {
        dispatch(fetchExpenses({ page, limit }));
      }
    } else {
      dispatch(fetchExpensesForUser({ page, limit }));
    }
  }, [
    dispatch,
    page,
    limit,
    debouncedSearch,
    filterMonth,
    filterYear,
    role,
    currentDepartment,
    currentSubDepartment,
  ]);

  // Modal handlers
  const handleOpen = (row) => {
    setSelectedExpense({ name: user?.name, ...row });
    setFormData({
      userId: row.user?._id,
      amount: row.amount,
      month: row.month,
      year: row.year,
      department: row.department?._id || "",
      subDepartment: row.subDepartment?._id || "",
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAdd = async () => {
    const response = await dispatch(addExpense(formData));
    if (addExpense.fulfilled.match(response)) {
      await dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false }));
      await dispatch(fetchExpenses({ page: 1, limit: 20 }));
      setFormData({
        userId: "",
        amount: "",
        month: currentMonth,
        year,
        department: "",
        subDepartment: "",
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
      }
      setOpen(false);
    } catch (err) {
      console.error("Unexpected error updating expense:", err);
    }
  };

  return {
    userExpenses,
    departments,
    subDepartments,
    currentDepartment,
    setCurrentDepartment,
    currentSubDepartment,
    setCurrentSubDepartment,
    allExpenses,
    stats,
    expenses,
    loading,
    meta,
    users,
    year,
    currentMonth,
    selectedMonth,
    setSelectedMonth,
    page,
    setPage,
    limit,
    setLimit,
    formData,
    setFormData,
    handleChange,
    open,
    handleOpen,
    handleClose,
    selectedExpense,
    setSelectedExpense,
    handleAdd,
    handleSubmit,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    getMonthByNumber,
  };
};
