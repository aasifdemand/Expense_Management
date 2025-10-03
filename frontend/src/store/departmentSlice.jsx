import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"


const initialState = {
    departments: [],
    subDepartments: [],
    department: null,
    subDepartment: null,
    loading: false,
    error: null
}


export const fetchDepartments = createAsyncThunk(
    "fetch/departments",
    async (_, { getState, rejectWithValue }) => {
        try {
            const csrf = getState().auth.csrf
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/department/departments`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-csrf-token": csrf
                }
            })


            const data = await response.json()

            // console.log("data: ", data);

            return data.departments

        } catch (error) {
            // Return a rejected value with a message
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: error.message });
            }
        }
    }
);


export const fetchSubDepartments = createAsyncThunk(
    "fetch/sub-departments",
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.csrf;
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/department/${id}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-csrf-token": token
                }
            })
            const data = await response.json()
            return data?.subDepartments

        } catch (error) {

            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            } else {
                return rejectWithValue({ message: error.message });
            }
        }
    }
);


export const departmentSlice = createSlice({
    name: "department",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDepartments.pending, (state) => {
                state.loading = true
            })

            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.departments = action.payload;
                state.loading = false
            })

            .addCase(fetchDepartments.rejected, (state, action) => {
                state.error = action.error.message
                state.loading = false
            })
            .addCase(fetchSubDepartments.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchSubDepartments.fulfilled, (state, action) => {
                state.subDepartments = action.payload;
                state.loading = false
            })
            .addCase(fetchSubDepartments.rejected, (state, action) => {
                state.error = action.error.message
                state.loading = false
            })
    }
})

export default departmentSlice.reducer