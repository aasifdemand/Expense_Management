import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    expenses: [],         // paginated
    allExpenses: [],      // full dataset for charts/stats
    userExpenses: [],     // user-specific paginated
    allUserExpenses: [],  // full dataset for user
    expense: null,
    loading: false,
    error: null,
    stats: {
        totalSpent: 0,
        totalReimbursed: 0,
        totalApproved: 0,
    },
    meta: {
        total: 0,
        page: 1,
        limit: 20,
    },
};


export const addExpense = createAsyncThunk(
    "expenses/addExpense",
    async (data, { getState, rejectWithValue }) => {
        try {
            const { paidTo, amount, department, date, proof, subDepartment, paymentMode, budget } = data;
            const formData = new FormData();
            formData.append("paidTo", paidTo);
            formData.append("amount", amount);
            formData.append("department", department);
            formData.append("subDepartment", subDepartment)
            formData.append("paymentMode", paymentMode)
            formData.append("month", String(new Date(date).getMonth() + 1));
            formData.append("year", String(new Date(date).getFullYear()));
            if (budget) formData.append("budgetId", budget)
            if (proof) formData.append("proof", proof);

            const csrf = getState().auth.csrf;
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses/create`, {
                method: "POST",
                credentials: "include",
                headers: { "x-csrf-token": csrf },
                body: formData,
            });
            if (!response.ok) throw new Error("Failed to add expense");
            const result = await response.json();
            return result?.expense;
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

// --- Update Expense ---
export const updateExpense = createAsyncThunk(
    "expenses/updateExpense",
    async ({ id, updates }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses/${id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error("Failed to update expense");
            const data = await response.json();
            return data?.expense;
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

// --- Fetch All Expenses ---
export const fetchExpenses = createAsyncThunk(
    "expenses/fetchAllExpenses",
    async ({ page = 1, limit = 20 }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;
            const query = new URLSearchParams({ page: String(page), limit: String(limit) });
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses?${query}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
            });
            if (!response.ok) throw new Error("Failed to fetch expenses");
            const data = await response.json();
            return {
                data: data?.data || [],
                allExpenses: data?.allExpenses || [],
                stats: data?.stats || { totalSpent: 0, totalReimbursed: 0, totalApproved: 0 },
                meta: data?.meta || { total: 0, page, limit },
            };
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

// --- Fetch Expenses for User ---
export const fetchExpensesForUser = createAsyncThunk(
    "expenses/fetchUserExpenses",
    async ({ page = 1, limit = 20 }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;
            const query = new URLSearchParams({ page: String(page), limit: String(limit) });
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses/user?${query}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
            });
            if (!response.ok) throw new Error("Failed to fetch user expenses");
            const data = await response.json();
            return {
                data: data?.data || [],
                allUserExpenses: data?.allExpenses || [],
                stats: data?.stats || { totalSpent: 0, totalReimbursed: 0, totalApproved: 0 },
                meta: data?.meta || { total: 0, page, limit },
            };
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

// --- Search Expenses ---
export const searchExpenses = createAsyncThunk(
    "expenses/search",
    async (
        { userName = "", department = "", isReimbursed, isApproved, minAmount, maxAmount, month = "", year = "", page = 1, limit = 10 },
        { getState, rejectWithValue }
    ) => {
        try {
            const csrf = getState().auth.csrf;
            const query = new URLSearchParams({
                ...(userName && { userName }),
                ...(department && { department }),
                ...(isReimbursed !== undefined && { isReimbursed: String(isReimbursed) }),
                ...(isApproved !== undefined && { isApproved: String(isApproved) }),
                ...(minAmount !== undefined && { minAmount: String(minAmount) }),
                ...(maxAmount !== undefined && { maxAmount: String(maxAmount) }),
                ...(month && { month }),
                ...(year && { year }),
                page: String(page),
                limit: String(limit),
            });
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses/search?${query}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
            });
            if (!response.ok) throw new Error("Failed to search expenses");
            const data = await response.json();
            return {
                data: data?.data || [],
                allExpenses: data?.allExpenses || [],
                stats: data?.stats || { totalSpent: 0, totalReimbursed: 0, totalApproved: 0 },
                meta: data?.meta || { total: 0, page, limit },
            };
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

// --- Slice ---
const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Add Expense
            .addCase(addExpense.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expense = action.payload;
                state.expenses.unshift(action.payload);
                state.allExpenses.unshift(action.payload);
                state.userExpenses.unshift(action.payload);
                state.allUserExpenses.unshift(action.payload);
            })
            .addCase(addExpense.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Update Expense
            .addCase(updateExpense.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const updateInArray = (arr) => {
                    const idx = arr.findIndex((e) => e._id === updated._id);
                    if (idx !== -1) arr[idx] = updated;
                };
                [state.expenses, state.allExpenses, state.userExpenses, state.allUserExpenses].forEach(updateInArray);
                state.expense = updated;
            })
            .addCase(updateExpense.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Fetch All Expenses
            .addCase(fetchExpenses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.data;
                state.allExpenses = action.payload.allExpenses;
                state.stats = action.payload.stats;
                state.meta = action.payload.meta;
            })
            .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Fetch Expenses For User
            .addCase(fetchExpensesForUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchExpensesForUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userExpenses = action.payload.data;
                state.allUserExpenses = action.payload.allUserExpenses;
                state.stats = action.payload.stats;
                state.meta = action.payload.meta;
            })
            .addCase(fetchExpensesForUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Search Expenses
            .addCase(searchExpenses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(searchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.data;
                state.allExpenses = action.payload.allExpenses;
                state.stats = action.payload.stats;
                state.meta = action.payload.meta;
            })
            .addCase(searchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export default expenseSlice.reducer;
