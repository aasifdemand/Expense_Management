import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateExpense,
  addExpense,
  searchExpenses,
  fetchExpenses,
  fetchExpensesForUser,
  fetchAdminExpenses,
} from "../store/expenseSlice";
import { getMonthByNumber } from "../utils/get-month";
import { fetchBudgets } from "../store/budgetSlice";
import {
  fetchDepartments,
  fetchSubDepartments,
} from "../store/departmentSlice";
import { useNavigate } from "react-router-dom";
import { useToastMessage } from "./useToast";
import { useLocation } from "../contexts/LocationContext";

export const useExpenses = () => {
  const dispatch = useDispatch();
  const {
    expenses,
    allExpenses,
    loading,
    meta,
    stats,

    // ✅ ADMIN (NEW)
    adminExpenses,
    adminStats,
    adminMeta,
  } = useSelector((state) => state.expense);

  const { role, user, users } = useSelector((state) => state.auth);
  const { departments, subDepartments } = useSelector(
    (state) => state.department
  );

  // Get location from context - this is already being set by navbar
  const { currentLoc } = useLocation();

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

  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [currentSubDepartment, setCurrentSubDepartment] = useState(null);

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
        // 🔥 searchExpenses already includes ADMIN + USER
        dispatch(
          searchExpenses({
            ...filters,
            page,
            limit,
            location: currentLoc,
          })
        );
      } else {
        // Normal listing (separate calls)
        dispatch(
          fetchExpenses({
            page,
            limit,
            location: currentLoc,
          })
        );

        dispatch(
          fetchAdminExpenses({
            page,
            limit,
          })
        );
      }
    }
    else {
      dispatch(fetchExpensesForUser({ userId: user?._id, page, limit }));
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
    currentLoc,
    user?._id,
  ]);


  // Reset to first page when location changes for better UX
  useEffect(() => {
    if (role === "superadmin" && currentLoc) {
      setPage(1); // Reset to first page when location changes
    }
  }, [currentLoc, role]);

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
  const navigate = useNavigate()
  const { success, error } = useToastMessage()

  const handleAdd = async () => {
    const response = await dispatch(addExpense(formData));
    if (addExpense.fulfilled.match(response)) {
      await Promise.all([
        dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false })),
        dispatch(fetchExpenses({ page: 1, limit: 20, location: currentLoc })), // Include current location
        dispatch(fetchExpensesForUser({ page, limit }))
      ]);

      setFormData({
        userId: "",
        amount: "",
        month: currentMonth,
        year,
        department: "",
        subDepartment: "",
      });

      success("Expense added successfully")
      setTimeout(() => { navigate("/user/expenses") }, 2000)
    }
    else {
      error("Something went wrong, please try again later")
    }
  };

  const handleSubmit = async () => {
    if (!selectedExpense) return;
    try {
      const resultAction = await dispatch(updateExpense({ id: selectedExpense._id, updates: formData }));
      if (updateExpense.fulfilled.match(resultAction)) {
        await Promise.all([
          dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false })),
          dispatch(fetchExpenses({ page: 1, limit: 20, location: currentLoc })), // Include current location
          dispatch(fetchExpensesForUser({ page, limit }))
        ]);
      }
      setOpen(false);
    } catch (err) {
      console.error("Unexpected error updating expense:", err);
    }
  };

  return {
    // existing exports
    departments,
    subDepartments,
    currentDepartment,
    setCurrentDepartment,
    currentSubDepartment,
    setCurrentSubDepartment,

    expenses,
    allExpenses,
    stats,
    meta,

    // ✅ ADMIN EXPORTS (NEW)
    adminExpenses,
    adminStats,
    adminMeta,

    loading,
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
    currentLocation: currentLoc,
  };

};