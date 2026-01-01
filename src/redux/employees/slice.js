import { createSlice } from '@reduxjs/toolkit';
import { fetchEmployees, addEmployee, updateEmployee } from './operations';

const employeesSlice = createSlice({
    name: 'employees',
    initialState: {
        list: [],
        isLoading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(addEmployee.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addEmployee.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addEmployee.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateEmployee.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateEmployee.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const employeesReducer = employeesSlice.reducer;