import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


const initialState = {
    expenses: [],
    userExpenses: [],
    expense: null,
    loading: false,
    error: null,
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
            const { paidTo, amount, department, date, proof } = data;
            const formData = new FormData();

            formData.append("paidTo", paidTo);
            formData.append("amount", amount);
            formData.append("department", department);
            formData.append("month", new Date(date).getMonth() + 1);
            formData.append("year", new Date(date).getFullYear());
            if (proof) formData.append("proof", proof);

            const csrf = getState().auth.csrf;

            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "x-csrf-token": csrf,
                },
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

export const updateExpense = createAsyncThunk(
    "expenses/updateExpense",
    async ({ id, updates }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;

            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses/${id}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrf,
                },
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

export const fetchExpenses = createAsyncThunk(
    "expenses/fetchAllExpenses",
    async ({ page = 1, limit = 20 }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;

            const query = new URLSearchParams({ page, limit });
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses?${query}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrf,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch expenses");

            const data = await response.json();
            return {
                expenses: data?.data || [],
                meta: data?.meta || { total: 0, page: 1, limit: 20 },
            };
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

export const fetchExpensesForUser = createAsyncThunk(
    "expenses/fetchUserExpenses",
    async ({ page = 1, limit = 20 }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;

            const query = new URLSearchParams({ page, limit });
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses/user?${query}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrf,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch user expenses");

            const data = await response.json();
            return {
                expenses: data?.data || [],
                meta: data?.meta || { total: 0, page: 1, limit: 20 },
            };
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

export const searchExpenses = createAsyncThunk(
    "expense/search",
    async (
        {
            userName = "",
            department = "",
            isReimbursed,
            isApproved,
            minAmount,
            maxAmount,
            month = "",
            year = "",
            page = 1,
            limit = 10,
        },
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

            const response = await fetch(
                `${import.meta.env.VITE_API_BASEURL}/expenses/search?${query.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "x-csrf-token": csrf,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to search expenses");
            }

            const data = await response.json();

            return {
                expenses: data?.data || [],
                meta: data?.meta || { total: 0, page: 1, limit: 10 },
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// --------------------
// ✅ Slice
// --------------------
const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ✅ Add Expense
            .addCase(addExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expense = action.payload;
                state.expenses.unshift(action.payload);
            })
            .addCase(addExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ✅ Update Expense
            .addCase(updateExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const idx = state.expenses.findIndex((e) => e._id === updated._id);
                if (idx !== -1) state.expenses[idx] = updated;
                const userIdx = state.userExpenses.findIndex((e) => e._id === updated._id);
                if (userIdx !== -1) state.userExpenses[userIdx] = updated;
                state.expense = updated;
            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ✅ Fetch All Expenses
            .addCase(fetchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.expenses;
                state.meta = action.payload.meta;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ✅ Fetch User Expenses
            .addCase(fetchExpensesForUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpensesForUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userExpenses = action.payload.expenses;
                state.meta = action.payload.meta;
            })
            .addCase(fetchExpensesForUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ✅ Search Expenses
            .addCase(searchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.expenses;
                state.meta = action.payload.meta;
            })
            .addCase(searchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// --------------------
export default expenseSlice.reducer;
