import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
    expenses: [],
    allExpenses: [],
    expense: null,

    // ✅ ADMIN EXPENSES (NEW – SEPARATE)
    adminExpenses: [],
    adminStats: {
        totalSpent: 0,
    },
    adminMeta: {
        total: 0,
        page: 1,
        limit: 20,
    },

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


// ===================== ADD EXPENSE =====================
export const addExpense = createAsyncThunk(
    "expenses/addExpense",
    async (formData, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;

            const response = await fetch(
                `${import.meta.env.VITE_API_BASEURL}/expenses/create`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "x-csrf-token": csrf,
                        // ❌ DO NOT set Content-Type for FormData
                    },
                    body: formData, // ✅ use FormData directly
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err?.message || "Failed to add expense");
            }

            const result = await response.json();
            return result?.expense;
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);


// ===================== UPDATE EXPENSE =====================
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


// ===================== FETCH ADMIN EXPENSES =====================
export const fetchAdminExpenses = createAsyncThunk(
    "expenses/fetchAdminExpenses",
    async ({ page = 1, limit = 20 }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;

            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });

            const response = await fetch(
                `${import.meta.env.VITE_API_BASEURL}/expenses/admin?${query}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "x-csrf-token": csrf,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch admin expenses");

            const data = await response.json();
            return {
                data: data?.data || [],
                stats: data?.stats || { totalSpent: 0 },
                meta: data?.meta || { total: 0, page, limit },
            };
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

// ===================== FETCH ALL EXPENSES =====================
export const fetchExpenses = createAsyncThunk(
    "expenses/fetchAllExpenses",
    async ({ page = 1, limit = 20, location = 'OVERALL' }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;
            const query = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                location: String(location)
            });
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
                location: data?.location || 'OVERALL',
            };
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

// ===================== FETCH EXPENSES FOR USER =====================
export const fetchExpensesForUser = createAsyncThunk(
    "expenses/fetchUserExpenses",
    async ({ userId, page = 1, limit = 20 }, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf;
            const query = new URLSearchParams({ page: String(page), limit: String(limit) });
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/expenses/user/${userId}?${query}`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
            });
            if (!response.ok) throw new Error("Failed to fetch user expenses");
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

// ===================== SEARCH EXPENSES =====================
export const searchExpenses = createAsyncThunk(
    "expenses/search",
    async (
        {
            userName = "",
            department = "",
            subDepartment = "",
            isReimbursed,
            isApproved,
            minAmount,
            maxAmount,
            month = "",
            year = "",
            page = 1,
            limit = 10,
            location = 'OVERALL'
        },
        { getState, rejectWithValue }
    ) => {
        try {
            const csrf = getState().auth.csrf;
            const query = new URLSearchParams({
                ...(userName && { userName }),
                ...(department && { department }),
                ...(subDepartment && { subDepartment }),
                ...(isReimbursed !== undefined && { isReimbursed: String(isReimbursed) }),
                ...(isApproved !== undefined && { isApproved: String(isApproved) }),
                ...(minAmount !== undefined && { minAmount: String(minAmount) }),
                ...(maxAmount !== undefined && { maxAmount: String(maxAmount) }),
                ...(month && { month }),
                ...(year && { year }),
                page: String(page),
                limit: String(limit),
                location: String(location),
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
                location: data?.location || 'OVERALL',
            };
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

// ===================== SLICE =====================
const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {

        clearExpenses: (state) => {
            state.expenses = [];
            state.allExpenses = [];
            state.stats = {
                totalSpent: 0,
                totalReimbursed: 0,
                totalApproved: 0,
            };
            state.meta = {
                total: 0,
                page: 1,
                limit: 20,
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Add Expense
            .addCase(addExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expense = action.payload;
                state.expenses.unshift(action.payload);
                state.allExpenses.unshift(action.payload);
            })
            .addCase(addExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Expense
            .addCase(updateExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                const updateInArray = (arr) => {
                    const idx = arr.findIndex((e) => e._id === updated._id);
                    if (idx !== -1) arr[idx] = updated;
                };
                [state.expenses, state.allExpenses].forEach(updateInArray);
                state.expense = updated;
            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch All Expenses
            .addCase(fetchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.data;
                state.allExpenses = action.payload.allExpenses;
                state.stats = action.payload.stats;
                state.meta = action.payload.meta;
                state.location = action.payload.location;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Expenses For User
            .addCase(fetchExpensesForUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpensesForUser.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.data;
                state.allExpenses = action.payload.allExpenses;
                state.stats = action.payload.stats;
                state.meta = action.payload.meta;
            })
            .addCase(fetchExpensesForUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })



            // Search Expenses
            .addCase(searchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchExpenses.fulfilled, (state, action) => {
                state.loading = false;

                // 🔥 SINGLE SOURCE OF TRUTH
                state.expenses = action.payload.data;
                state.allExpenses = action.payload.allExpenses;

                // ⛔ Clear admin-only lists to prevent stale UI
                state.adminExpenses = [];
                state.adminMeta = { total: 0, page: 1, limit: 20 };

                state.stats = action.payload.stats;
                state.meta = action.payload.meta;
                state.location = action.payload.location;
            })

            .addCase(searchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // ===================== ADMIN EXPENSES =====================
            .addCase(fetchAdminExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.adminExpenses = action.payload.data;
                state.adminStats = action.payload.stats;
                state.adminMeta = action.payload.meta;
            })
            .addCase(fetchAdminExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});

export const { setLocation, clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;