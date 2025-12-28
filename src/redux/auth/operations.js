import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabaseClient';

/*
 * РЕЄСТРАЦІЯ (Тільки для Клієнтів)
 */
export const register = createAsyncThunk(
    'auth/register',
    async ({ email, password, full_name, phone }, { rejectWithValue }) => {
        try {
        // 1. Реєструємо в Supabase Auth
        // Передаємо meta_data, щоб наш SQL-тригер (який ми створили раніше)
        // автоматично записав юзера в таблицю 'clients'
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

/*
 * ВХІД (Login) + Визначення ролі
 */
export const logIn = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
        // 1. Логінимось
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return rejectWithValue(error.message);

        const user = data.user;
        let role = 'client'; // За замовчуванням вважаємо, що це клієнт

        // 2. Перевіряємо, чи є цей юзер у таблиці співробітників
        // .maybeSingle() повертає null (а не помилку), якщо запису немає
        const { data: employee } = await supabase
            .from('employees')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        // 3. Якщо знайшли в співробітниках - беремо його роль
        if (employee) {
            role = employee.role; // 'admin', 'manager', 'jeweler' тощо
        }

        // Повертаємо об'єкт, який піде в Redux State
        return { user, session: data.session, role };
        } catch (error) {
        return rejectWithValue(error.message);
        }
    }
);

/*
 * ВИХІД (Logout)
 */
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

/*
 * ПЕРЕВІРКА СЕСІЇ (Refresh User)
 * Викликається, коли користувач оновлює сторінку (F5), щоб не злітала авторизація
 */
export const refreshUser = createAsyncThunk(
    'auth/refresh',
    async (_, { rejectWithValue }) => {
        try {
        // 1. Отримуємо поточну сесію з локального сховища
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            return rejectWithValue('No session');
        }

        const user = session.user;
        let role = 'client';

        // 2. Знову мусимо перевірити роль, бо Redux очистився при оновленні сторінки
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

/*
 * ОНОВЛЕННЯ ПРОФІЛЮ КЛІЄНТА
 */
export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async ({ full_name, phone }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const userId = state.auth.user.id;

            // 1. Оновлюємо дані в таблиці 'clients'
            const { data, error } = await supabase
                .from('clients')
                .update({ full_name, phone })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            // Повертаємо нові дані, щоб оновити Redux
            return data; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);