import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    expenses: [],
    expense: null,
    loading: false,
    error: null,
    meta: { total: 0, page: 1, limit: 20 },
};


export const addExpense = createAsyncThunk(
    "expenses/add",
    async (data, { getState, rejectWithValue }) => {

        const { paidTo, amount, department, date, proof } = data
        const formdata = new FormData()

        formdata.append("paidTo", paidTo)
        formdata.append("amount", amount)
        formdata.append("department", department)
        formdata.append("month", new Date(date)?.getMonth() + 1)
        formdata.append("year", new Date(date)?.getFullYear())
        formdata.append("proof", proof)
        try {
            const csrf = getState().auth.csrf;
            const response = await fetch(
                `${import.meta.env.VITE_API_BASEURL}/expenses/create`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {

                        "x-csrf-token": csrf,
                    },
                    body: formdata
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add expense");
            }

            const data = await response.json();
            return data?.expense;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// ✅ Update Expense
export const updateExpense = createAsyncThunk(
    "expenses/update",
    async ({ id, updates }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;
            const response = await fetch(
                `${import.meta.env.VITE_API_BASEURL}/expenses/${id}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "x-csrf-token": csrf,
                    },
                    body: JSON.stringify(updates),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update expense");
            }

            const data = await response.json();
            return data?.expense;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchExpenses = createAsyncThunk(
    "expenses/fetchAll",
    async ({ page = 1, limit = 20 }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;

            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });

            const response = await fetch(
                `${import.meta.env.VITE_API_BASEURL}/expenses?${query.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "x-csrf-token": csrf,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch expenses");

            const data = await response.json();
            return {
                expenses: data?.data || [],
                meta: data?.meta || { total: 0, page: 1, limit: 20 },
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const searchExpenses = createAsyncThunk(
    "expenses/search",
    async (
        {
            userName = "",
            paidTo = "",
            department = "",
            isReimbursed,
            isApproved,
            minAmount,
            maxAmount,
            month,
            year,
            page = 1,
            limit = 20,
        },
        { getState, rejectWithValue }
    ) => {
        try {
            const csrf = getState().auth.csrf;

            const query = new URLSearchParams({
                ...(userName && { userName }),
                ...(paidTo && { paidTo }),
                ...(department && { department }),
                ...(isReimbursed !== undefined && { isReimbursed: String(isReimbursed) }),
                ...(isApproved !== undefined && { isApproved: String(isApproved) }),
                ...(minAmount !== undefined && { minAmount: String(minAmount) }),
                ...(maxAmount !== undefined && { maxAmount: String(maxAmount) }),
                ...(month !== undefined && { month: String(month) }),
                ...(year !== undefined && { year: String(year) }),
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

            if (!response.ok) throw new Error("Failed to search expenses");

            const data = await response.json();

            return {
                expenses: data?.data || [],
                meta: data?.meta || { total: data?.count || 0, page, limit },
            };
        } catch (error) {
            return rejectWithValue(error.message);
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
            .addCase(addExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses.unshift(action.payload);
                state.expense = action.payload;
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
                const idx = state.expenses.findIndex((e) => e._id === action.payload._id);
                if (idx !== -1) {
                    state.expenses[idx] = action.payload;
                }
                state.expense = action.payload;
            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
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

            // Search
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

export default expenseSlice.reducer;
