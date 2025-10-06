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
  async (_, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
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

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  "auth/fetch-users",
  async (_, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/auth/users`,
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
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      return data?.users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create new user
export const createUser = createAsyncThunk(
  "auth/create-user",
  async (userData, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/auth/users/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reset user password
export const resetUserPassword = createAsyncThunk(
  "auth/reset-user-password",
  async ({ userId, password }, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/auth/reset/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// For updating own profile
export const updateUserProfile = createAsyncThunk(
  "auth/update-profile",
  async (updateData, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/auth/profile/${updateData?.userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrf,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single user (session)
export const fetchUser = createAsyncThunk(
  "auth/fetch-user",
  async (_, { getState, rejectWithValue }) => {
    try {
      const csrf = getState().auth.csrf;
      const response = await fetch(
        `${import.meta.env.VITE_API_BASEURL}/auth/session`,
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
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      return data?.user;
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
  users: [],
  user: safeJSONParse("user", null),
  userLoading: false,
  userError: null,
  updateProfileLoading: false,
  updateProfileError: null
};

const persistToLocalStorage = (state) => {
  localStorage.setItem("authenticated", JSON.stringify(state.isAuthenticated));
  localStorage.setItem("twoFactorVerified", JSON.stringify(state.isTwoFactorVerified));
  localStorage.setItem("twoFactorPending", JSON.stringify(state.isTwoFactorPending));
  localStorage.setItem("role", JSON.stringify(state.role));
  localStorage.setItem("qr", JSON.stringify(state.qr));
  localStorage.setItem("csrf", JSON.stringify(state.csrf));
  localStorage.setItem("users", JSON.stringify(state.users));
  localStorage.setItem("user", JSON.stringify(state.user));
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      Object.assign(state, action.payload);
      persistToLocalStorage(state);
    },
    clearErrors: (state) => {
      state.error = null;
      state.userError = null;
      state.updateProfileError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Logout
      .addCase(logout.pending, (state) => {
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
        state.users = [];
        state.user = null;

        // Clear localStorage
        localStorage.removeItem("authenticated");
        localStorage.removeItem("twoFactorVerified");
        localStorage.removeItem("twoFactorPending");
        localStorage.removeItem("role");
        localStorage.removeItem("qr");
        localStorage.removeItem("csrf");
        localStorage.removeItem("users");
        localStorage.removeItem("user");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.userLoading = false;
        state.users = action.payload;
        persistToLocalStorage(state);
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      // Fetch single user
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        persistToLocalStorage(state);
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.userLoading = false;
        state.users.push(action.payload);
        persistToLocalStorage(state);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      // Reset user password
      .addCase(resetUserPassword.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.userLoading = false;
        state.userError = null;
        persistToLocalStorage(state);
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updateProfileLoading = true;
        state.updateProfileError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileError = null;
        // Update both the user object and potentially the current user in state
        state.user = action.payload;

        // If the updated user is in the users list, update it there too
        const userIndex = state.users.findIndex(user => user.id === action.payload.id);
        if (userIndex !== -1) {
          state.users[userIndex] = action.payload;
        }

        persistToLocalStorage(state);
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileError = action.payload;
      });
  },
});

export const { setAuthState, clearErrors } = authSlice.actions;
export default authSlice.reducer;