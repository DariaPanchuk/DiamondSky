import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabaseClient';

const parseNumberSafe = (value, isFloat = false) => {
    if (value === '' || value === null || value === undefined) return 0;
    const num = isFloat ? parseFloat(value) : parseInt(value, 10);
    return isNaN(num) ? 0 : num;
};

// Отримання всіх клієнтів
export const fetchClients = createAsyncThunk(
    'clients/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('full_name');
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Fetch Clients Error:", error);
            return rejectWithValue(error.message);
        }
    }
);

// Додавання нового клієнта
export const addClient = createAsyncThunk(
    'clients/add',
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const dbPayload = {
                full_name: formData.full_name,
                phone: formData.phone,
                birthday: formData.birthday || null,
                personal_discount_percent: parseNumberSafe(formData.discount_percent), 
                total_spent: parseNumberSafe(formData.total_spent, true), 
                email: formData.email || null,
            };

            const { error } = await supabase
                .from('clients')
                .insert([dbPayload]);

            if (error) throw error;
            
            dispatch(fetchClients());
        } catch (error) {
            console.error("Add Client Error:", error);
            return rejectWithValue(error.message);
        }
    }
);

// Оновлення клієнта
export const updateClient = createAsyncThunk(
    'clients/update',
    async ({ id, updates }, { rejectWithValue, dispatch }) => {
        try {
            const dbUpdates = {};
            
            if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name;
            if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            
            if (updates.discount_percent !== undefined) {
                dbUpdates.personal_discount_percent = parseNumberSafe(updates.discount_percent);
            }

            if (updates.total_spent !== undefined) {
                dbUpdates.total_spent = parseNumberSafe(updates.total_spent, true);
            }

            if (updates.birthday !== undefined) dbUpdates.birthday = updates.birthday;

            const { error } = await supabase
                .from('clients')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            dispatch(fetchClients());
        } catch (error) {
            console.error("Update Client Error:", error);
            return rejectWithValue(error.message);
        }
    }
);

// Видалення клієнта
export const deleteClient = createAsyncThunk(
    'clients/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Після видалення оновлюємо список
            dispatch(fetchClients());
        } catch (error) {
            console.error("Delete Client Error:", error);
            return rejectWithValue(error.message);
        }
    }
);