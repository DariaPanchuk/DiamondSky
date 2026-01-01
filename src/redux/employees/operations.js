import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabaseClient';

export const fetchEmployees = createAsyncThunk(
    'employees/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('full_name');
            if (error) throw error;
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addEmployee = createAsyncThunk(
    'employees/add',
    async (employeeData, { rejectWithValue, dispatch }) => {
        try {
            const { error } = await supabase
                .from('employees')
                .insert([employeeData]);

            if (error) throw error;
            
            dispatch(fetchEmployees()); 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateEmployee = createAsyncThunk(
    'employees/update',
    async ({ id, updates }, { rejectWithValue, dispatch }) => {
        try {
            const { error } = await supabase
                .from('employees')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            dispatch(fetchEmployees());
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);