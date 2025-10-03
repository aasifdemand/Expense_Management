import { configureStore } from "@reduxjs/toolkit"

import AuthReducer from "./authSlice"
import budgetReducer from "./budgetSlice"
import expenseReducer from "./expenseSlice"
import departmentReducer from "./departmentSlice"

export const store = configureStore({
    reducer: {
        auth: AuthReducer,
        budget: budgetReducer,
        expense: expenseReducer,
        department: departmentReducer
    }
})