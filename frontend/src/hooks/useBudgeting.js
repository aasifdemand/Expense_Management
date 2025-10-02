import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  allocateBudget,
  fetchBudgets,
  searchBudgets,
  updateBudget,
} from "../store/budgetSlice";
import { getMonthByNumber } from "../utils/get-month";
import { fetchExpenses } from "../store/expenseSlice";

export const useBudgeting = () => {
  const dispatch = useDispatch();
  const { budgets, loading, meta, allBudgets } = useSelector((state) => state?.budget);
  const { users } = useSelector((state) => state?.auth);

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
  }, [dispatch, page, limit, debouncedSearch, filterMonth, filterYear,]);


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

    const months = [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
    ];

    // Convert month label to number
    const monthObj = months.find(m => m.label === formData.month);
    const monthNumber = monthObj ? monthObj.value : null;

    if (!monthNumber) {
      console.error("Invalid month:", formData.month);
      return;
    }

    const payload = {
      ...formData,
      month: monthNumber, // now backend receives 10 instead of "October"
    };

    console.log("formdata after mapping: ", payload);

    const resultAction = await dispatch(allocateBudget(payload));

    if (allocateBudget.fulfilled.match(resultAction)) {
      await dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false }));
      await dispatch(fetchExpenses({ page: 1, limit: 20 }));
      setFormData({
        userId: "",
        amount: "",
        month: getMonthByNumber(currentMonth),
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
      await dispatch(fetchBudgets({ page: 1, limit: 10, month: "", year: "", all: false }))
      await dispatch(fetchExpenses({ page: 1, limit: 20 }))
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
    selectedMonth, setSelectedMonth
  };
};