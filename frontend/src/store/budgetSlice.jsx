import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  budgets: [],
  budget: null,
  loading: false,
  error: null,
  meta: { total: 0, page: 1, limit: 10 },
};


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

      if (!response.ok) {
        throw new Error("Failed to allocate budget");
      }

      const data = await response.json();
      return data?.budget;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchBudgets = createAsyncThunk(
  "budget/fetchAll",
  async ({ page = 1, limit = 10, month = "", year = "" }, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(month && { month: String(month) }),
        ...(year && { year: String(year) }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/budget?${query.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch budgets");

      const data = await response.json();

      return {
        budgets: data?.data || [],
        meta: data?.meta || { total: 0, page: 1, limit: 10, totalAllocated: 0, totalSpent: 0 },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
        ...(minAllocated !== undefined && { minAllocated: String(minAllocated) }),
        ...(maxAllocated !== undefined && { maxAllocated: String(maxAllocated) }),
        ...(minSpent !== undefined && { minSpent: String(minSpent) }),
        ...(maxSpent !== undefined && { maxSpent: String(maxSpent) }),
        page: String(page),
        limit: String(limit),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/budget/search?${query.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to search budgets");

      const data = await response.json();

      return {
        budgets: data?.data || [],
        meta: data?.meta || { total: 0, page: 1, limit: 10, totalAllocated: 0, totalSpent: 0 },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const updateBudget = createAsyncThunk(
  "budget/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/budget/${id}`,
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
        throw new Error("Failed to update budget");
      }

      const data = await response.json();
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

  },
  extraReducers: (builder) => {
    builder
      // Allocate Budget
      .addCase(allocateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(allocateBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.unshift(action.payload);
        state.budget = action.payload;
      })
      .addCase(allocateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.budgets;
        state.meta = action.payload.meta;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.budgets.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) {
          state.budgets[idx] = action.payload;
        }
        state.budget = action.payload;
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    builder
      .addCase(searchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.budgets;
        state.meta = action.payload.meta;
      })
      .addCase(searchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export default budgetSlice.reducer;
