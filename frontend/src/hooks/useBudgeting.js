import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  allocateBudget,
  fetchBudgets,
  searchBudgets,
  updateBudget,
} from "../store/budgetSlice";
import { getMonthByNumber } from "../utils/get-month";

export const useBudgeting = () => {
  const dispatch = useDispatch();
  const { budgets, loading, meta } = useSelector((state) => state?.budget);
  const { users } = useSelector((state) => state?.auth);

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
    const hasFilters =
      Boolean(filterMonth) || Boolean(filterYear) || debouncedSearch?.trim();

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
      dispatch(
        fetchBudgets({
          page,
          limit,
        })
      );
    }
  }, [dispatch, page, limit, debouncedSearch, filterMonth, filterYear]);


  const handleOpen = (row) => {
    setSelectedBudget(row);
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
    const response = await dispatch(allocateBudget(formData));
    if (response) {
      setFormData({
        userId: "",
        amount: "",
        month: currentMonth,
        year: year,
      });
    }
  };

  const handleSubmit = () => {
    if (!selectedBudget) return;
    dispatch(updateBudget({ id: selectedBudget._id, updates: formData }));
    setOpen(false);
  };

  return {
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
  };
};
