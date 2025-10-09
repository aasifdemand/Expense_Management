import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchReimbursements = createAsyncThunk(
    "reimbursement/fetchReimbursements",
    async ({ location, page, limit } = {}, { rejectWithValue, getState }) => {
        try {
            const csrf = getState().auth.csrf;

            // Build query parameters
            const params = new URLSearchParams();
            if (location) params.append('location', location);
            if (page) params.append('page', page);
            if (limit) params.append('limit', limit);

            const queryString = params.toString();
            const url = `${import.meta.env.VITE_API_BASEURL}/reimbursement${queryString ? `?${queryString}` : ''}`;

            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    "X-csrf-token": csrf,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch reimbursements");

            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchReimbursementsForUser = createAsyncThunk(
    "reimbursement/fetchReimbursementsforuser",
    async ({ id, page, limit } = {}, { rejectWithValue, getState }) => {
        try {
            const csrf = getState().auth.csrf;

            // Build query parameters
            const params = new URLSearchParams();

            if (page) params.append('page', page);
            if (limit) params.append('limit', limit);

            const queryString = params.toString();
            const url = `${import.meta.env.VITE_API_BASEURL}/reimbursement/${id}${queryString ? `?${queryString}` : ''}`;

            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    "X-csrf-token": csrf,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch reimbursements");

            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const markAsReimbursed = createAsyncThunk(
    "reimbursement/markReimbursed",
    async ({ id, isReimbursed }, { rejectWithValue, getState }) => {
        try {
            const csrf = getState().auth.csrf;
            const res = await fetch(
                `${import.meta.env.VITE_API_BASEURL}/reimbursement/admin/${id}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "X-csrf-token": csrf,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ isReimbursed }),
                }
            );

            if (!res.ok) throw new Error("Failed to update reimbursement");

            const data = await res.json();
            return data?.reimbursement;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const initialState = {
    reimbursements: [],
    userReimbursements: [],
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20
    },
    stats: {
        totalReimbursements: 0,
        totalAmount: 0,
        totalReimbursed: 0,
        totalPending: 0,
        totalReimbursedAmount: 0,
        totalPendingAmount: 0,
    },
    location: 'OVERALL'
};

export const reimbursementSlice = createSlice({
    name: "reimbursement",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setLocation: (state, action) => {
            state.location = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // ---- FETCH ALL REIMBURSEMENTS ----
            .addCase(fetchReimbursements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReimbursements.fulfilled, (state, action) => {
                state.loading = false;
                state.reimbursements = action.payload.data || [];
                state.stats = action.payload.stats || initialState.stats;

                const meta = action.payload.meta || {};

                // ✅ Correctly compute pagination
                state.pagination = {
                    currentPage: meta.page || 1,
                    itemsPerPage: meta.limit || 20,
                    totalItems: meta.total || 0,
                    totalPages: Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 20))),
                };

                state.location = action.payload.location || 'OVERALL';
            })
            .addCase(fetchReimbursements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---- FETCH USER REIMBURSEMENTS ----
            .addCase(fetchReimbursementsForUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchReimbursementsForUser.fulfilled, (state, action) => {
                state.loading = false
                state.userReimbursements = action.payload.data || [];
            })


            .addCase(fetchReimbursementsForUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ---- MARK REIMBURSED ----
            .addCase(markAsReimbursed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markAsReimbursed.fulfilled, (state, action) => {
                state.loading = false;

                // ✅ More reliable state update
                const updatedReimbursement = action.payload;
                const index = state.reimbursements.findIndex(
                    (r) => r._id === updatedReimbursement._id
                );

                if (index !== -1) {
                    // Create a new array to ensure re-render
                    state.reimbursements = [
                        ...state.reimbursements.slice(0, index),
                        { ...state.reimbursements[index], ...updatedReimbursement },
                        ...state.reimbursements.slice(index + 1)
                    ];
                }
            })
            .addCase(markAsReimbursed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export const { clearError, setLocation } = reimbursementSlice.actions;
export default reimbursementSlice.reducer;