import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const safeJSONParse = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const logout = createAsyncThunk(
  "auth/logout",
  async (csrf, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Logout request failed");
      }

      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isAuthenticated: safeJSONParse("authenticated", false),
  isTwoFactorVerified: safeJSONParse("twoFactorVerified", false),
  isTwoFactorPending: safeJSONParse("twoFactorPending", false),
  role: safeJSONParse("role", null),
  qr: safeJSONParse("qr", null),
  csrf: safeJSONParse("csrf", null),
  loading: false,
  error: null,
};

const persistToLocalStorage = (state) => {
  localStorage.setItem("authenticated", JSON.stringify(state.isAuthenticated));
  localStorage.setItem("twoFactorVerified", JSON.stringify(state.isTwoFactorVerified));
  localStorage.setItem("twoFactorPending", JSON.stringify(state.isTwoFactorPending));
  localStorage.setItem("role", JSON.stringify(state.role));
  localStorage.setItem("qr", JSON.stringify(state.qr));
  localStorage.setItem("csrf", JSON.stringify(state.csrf));
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      // ✅ merge payload into state instead of replacing
      Object.assign(state, action.payload);

      persistToLocalStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.isTwoFactorVerified = false;
        state.isTwoFactorPending = false;
        state.role = null;
        state.qr = null;
        state.csrf = null;
        state.loading = false;

        // clear localStorage
        localStorage.removeItem("authenticated");
        localStorage.removeItem("twoFactorVerified");
        localStorage.removeItem("twoFactorPending");
        localStorage.removeItem("role");
        localStorage.removeItem("qr");
        localStorage.removeItem("csrf");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuthState } = authSlice.actions;
export default authSlice.reducer;
