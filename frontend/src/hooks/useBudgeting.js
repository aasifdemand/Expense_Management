import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  allocateBudget,
  fetchBudgets,
  fetchUserBudgets,
  searchBudgets,
  updateBudget,
} from "../store/budgetSlice";
import { getMonthByNumber } from "../utils/get-month";
import { fetchExpenses } from "../store/expenseSlice";

export const useBudgeting = () => {
  const dispatch = useDispatch();
  const { budgets, loading, meta, allBudgets } = useSelector((state) => state?.budget);
  const { users } = useSelector((state) => state?.auth);
  const { user } = useSelector((state) => state?.auth);

  const year = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formData, setFormData] = useState({
    userId: "",
    amount: 0,
    month: currentMonth,
    year,
  });

  const [open, setOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

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
    const hasFilters = debouncedSearch?.trim() || filterMonth || filterYear;

    if (hasFilters) {
      dispatch(
        searchBudgets({
          userName: debouncedSearch || undefined,
          month: filterMonth || undefined,
          year: filterYear || undefined,
          page,
          limit,
        })
      );
    } else {
      if (user?.role === "superadmin") {
        dispatch(
          fetchBudgets({
            page,
            limit,
          })
        );
      } else {
        // FIX: Make sure user._id is available and call fetchUserBudgets
        if (user?._id) {
          dispatch(
            fetchUserBudgets({
              userId: user._id, // ✅ This was missing
              page,
              limit,
            })
          );
        }
      }
    }
  }, [
    dispatch,
    page,
    limit,
    debouncedSearch,
    filterMonth,
    filterYear,
    user, // ✅ Added user to dependencies
    user?._id, // ✅ Added user._id to ensure it triggers when user changes
    user?.role // ✅ Added user.role to ensure it triggers when role changes
  ]);

  const handleOpen = (row) => {
    console.log("row: ", row);
    setSelectedBudget(row);
    setFormData({
      userId: row?.user?._id,
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
    console.log("formdata before mapping: ", formData);

    const payload = {
      ...formData,
    };

    console.log("formdata after mapping: ", payload);

    const resultAction = await dispatch(allocateBudget(payload));

    if (allocateBudget.fulfilled.match(resultAction)) {
      // FIX: Refetch based on user role after allocation
      if (user?.role === "superadmin") {
        await dispatch(fetchBudgets({ page: 1, limit: 10 }));
      } else {
        await dispatch(fetchUserBudgets({ userId: user?._id, page: 1, limit: 10 }));
      }
      await dispatch(fetchExpenses({ page: 1, limit: 20 }));
      setFormData({
        userId: "",
        amount: "",
        month: currentMonth,
        year: year,
      });
    } else {
      console.error("Allocation failed:", resultAction);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBudget) return;

    const res = await dispatch(
      updateBudget({ id: selectedBudget._id, updates: formData })
    );

    if (updateBudget.fulfilled.match(res)) {
      // FIX: Refetch based on user role after update
      if (user?.role === "superadmin") {
        await dispatch(fetchBudgets({ page: 1, limit: 10 }));
      } else {
        await dispatch(fetchUserBudgets({ userId: user?._id, page: 1, limit: 10 }));
      }
      await dispatch(fetchExpenses({ page: 1, limit: 20 }));
    }

    setOpen(false);
  };

  return {
    allBudgets,
    budgets,
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
    selectedMonth,
    setSelectedMonth
  };
};