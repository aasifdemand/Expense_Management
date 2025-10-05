import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  budgets: [],       // paginated
  allBudgets: [],    // full dataset for stats/charts
  budget: null,
  loading: false,
  error: null,
  meta: { total: 0, page: 1, limit: 20 },
};

// --- Allocate Budget ---
export const allocateBudget = createAsyncThunk(
  "budget/allocate",
  async (budgetData, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/budget/allocate`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf,
          },
          body: JSON.stringify(budgetData),
        }
      );
      if (!response.ok) throw new Error("Failed to allocate budget");
      const data = await response.json();
      return data?.budget;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- Fetch Budgets (All budgets with optional userId filter) ---
export const fetchBudgets = createAsyncThunk(
  "budget/fetchAll",
  async (
    { page = 1, limit = 10, month = "", year = "", userId },
    { getState, rejectWithValue }
  ) => {
    try {
      const csrf = getState().auth.csrf;
      const query = new URLSearchParams();

      if (userId) query.append("userId", String(userId));
      query.append("page", String(page));
      query.append("limit", String(limit));

      if (month) query.append("month", String(month));
      if (year) query.append("year", String(year));

      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/budget?${query.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch budgets");

      const data = await response.json();

      return {
        budgets: data?.data || [],
        allBudgets: data?.allBudgets || [],
        meta: data?.meta || { total: 0, page, limit, totalAllocated: 0, totalSpent: 0 },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- NEW: Fetch User Budgets (Specific user only) ---
export const fetchUserBudgets = createAsyncThunk(
  "budget/fetchUserBudgets",
  async (
    { userId, page = 1, limit = 10 },
    { getState, rejectWithValue }
  ) => {
    try {
      const csrf = getState().auth.csrf;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/budget/user/${userId}?${query.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user budgets");

      const data = await response.json();

      return {
        budgets: data?.data || [],
        allBudgets: data?.allBudgets || [],
        meta: data?.meta || { total: 0, page, limit },
        userId, // Include userId in response for tracking
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- Search Budgets ---
export const searchBudgets = createAsyncThunk(
  "budget/search",
  async (
    {
      userName = "",
      month = "",
      year = "",
      minAllocated,
      maxAllocated,
      minSpent,
      maxSpent,
      page = 1,
      limit = 10,
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const csrf = getState().auth.csrf;
      const query = new URLSearchParams({
        ...(userName && { userName }),
        ...(month && { month: String(month) }),
        ...(year && { year: String(year) }),
        ...(minAllocated !== undefined && { minAllocated }),
        ...(maxAllocated !== undefined && { maxAllocated }),
        ...(minSpent !== undefined && { minSpent }),
        ...(maxSpent !== undefined && { maxSpent }),
        page: String(page),
        limit: String(limit),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/budget/search?${query.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        }
      );
      if (!response.ok) throw new Error("Failed to search budgets");

      const data = await response.json();

      return {
        budgets: data?.data || [],
        allBudgets: data?.allBudgets || [],
        meta: data?.meta || { total: 0, page, limit, totalAllocated: 0, totalSpent: 0 },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- Update Budget ---
export const updateBudget = createAsyncThunk(
  "budget/update",
  async ({ id, updates }, { dispatch, getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/budget/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
          body: JSON.stringify(updates),
        }
      );
      if (!response.ok) throw new Error("Failed to update budget");
      const data = await response.json();

      // Re-fetch latest budgets
      const { page, limit } = getState().budget.meta;
      dispatch(fetchBudgets({ page, limit }));

      return data?.budget;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- Slice ---
const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    // Optional: Add a reducer to clear user-specific data when needed
    clearUserBudgets: (state) => {
      state.budgets = [];
      state.allBudgets = [];
      state.meta = { total: 0, page: 1, limit: 20 };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(allocateBudget.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(allocateBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.unshift(action.payload);
        state.allBudgets.unshift(action.payload); // ✅ also update allBudgets
        state.budget = action.payload;
      })
      .addCase(allocateBudget.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchBudgets.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.budgets;
        state.allBudgets = action.payload.allBudgets; // ✅ store allBudgets
        state.meta = action.payload.meta;
      })
      .addCase(fetchBudgets.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // NEW: User budgets cases
      .addCase(fetchUserBudgets.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUserBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.budgets;
        state.allBudgets = action.payload.allBudgets; // ✅ store allBudgets
        state.meta = action.payload.meta;
        // Optional: Store the userId we fetched for
        state.meta.userId = action.payload.userId;
      })
      .addCase(fetchUserBudgets.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateBudget.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateBudget.fulfilled, (state, action) => { state.loading = false; state.budget = action.payload; })
      .addCase(updateBudget.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(searchBudgets.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(searchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.budgets;
        state.allBudgets = action.payload.allBudgets; // ✅ store allBudgets
        state.meta = action.payload.meta;
      })
      .addCase(searchBudgets.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearUserBudgets } = budgetSlice.actions;
export default budgetSlice.reducer;