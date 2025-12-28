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
            // --- FETCH (Отримання списку) ---
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

            // --- ADD (Додавання) ---
            .addCase(addEmployee.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addEmployee.fulfilled, (state) => {
                state.isLoading = false;
                // Список не чіпаємо, бо операція сама викличе fetchEmployees
            })
            .addCase(addEmployee.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // --- UPDATE (Оновлення) ---
            .addCase(updateEmployee.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateEmployee.fulfilled, (state) => {
                state.isLoading = false;
                // Список не чіпаємо, бо операція сама викличе fetchEmployees
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const employeesReducer = employeesSlice.reducer;