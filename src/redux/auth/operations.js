import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabaseClient';

export const register = createAsyncThunk(
    'auth/register',
    async ({ email, password, full_name, phone }, { rejectWithValue }) => {
        try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
            data: {
                full_name,
                phone,
            },
            },
        });

        if (error) return rejectWithValue(error.message);

        return data.user;
        } catch (error) {
        return rejectWithValue(error.message);
        }
    }
);

export const logIn = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return rejectWithValue(error.message);

        const user = data.user;
        let role = 'client'; 

        const { data: employee } = await supabase
            .from('employees')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (employee) {
            role = employee.role; 
        }

        return { user, session: data.session, role };
        } catch (error) {
        return rejectWithValue(error.message);
        }
    }
);

export const logOut = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
        const { error } = await supabase.auth.signOut();
        if (error) return rejectWithValue(error.message);
        } catch (error) {
        return rejectWithValue(error.message);
        }
    }
);

export const refreshUser = createAsyncThunk(
    'auth/refresh',
    async (_, { rejectWithValue }) => {
        try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            return rejectWithValue('No session');
        }

        const user = session.user;
        let role = 'client';

        const { data: employee } = await supabase
            .from('employees')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (employee) {
            role = employee.role;
        }

        return { user, session, role };
        } catch (error) {
        return rejectWithValue(error.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async ({ full_name, phone }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const userId = state.auth.user.id;
            const { data, error } = await supabase
                .from('clients')
                .update({ full_name, phone })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return data; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);