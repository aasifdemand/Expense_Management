import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchReimbursements = createAsyncThunk(
    "reimbursement/fetchReimbursements",
    async (_, { rejectWithValue, getState }) => {
        try {
            const csrf = getState().auth.csrf;
            const res = await fetch(`${import.meta.env.VITE_API_BASEURL}/reimbursement`, {
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
    loading: false,
    error: null,
};

export const reimbursementSlice = createSlice({
    name: "reimbursement",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ---- FETCH ----
            .addCase(fetchReimbursements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReimbursements.fulfilled, (state, action) => {
                state.loading = false;
                state.reimbursements = action.payload;
            })
            .addCase(fetchReimbursements.rejected, (state, action) => {
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

                const index = state.reimbursements.findIndex(
                    (r) => r._id === action.payload._id
                );
                if (index !== -1) {
                    state.reimbursements[index] = action.payload;
                }
            })
            .addCase(markAsReimbursed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default reimbursementSlice.reducer;
