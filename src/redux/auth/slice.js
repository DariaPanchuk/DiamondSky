import { createSlice } from '@reduxjs/toolkit';
import { register, logIn, logOut, refreshUser, updateUserProfile } from './operations';

const initialState = {
    user: null,         // Об'єкт юзера
    token: null,        // Токен доступу
    role: null,         // 'client' | 'admin' | 'jeweler'
    isLoggedIn: false,  // Чи авторизований
    isRefreshing: false,// Чи йде перевірка сесії (щоб показувати loader при старті)
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Скидання помилок вручну (наприклад, коли юзер почав вводити новий пароль)
        clearError: (state) => {
        state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        // --- REGISTER ---
        .addCase(register.fulfilled, (state, action) => {
            state.user = action.payload;
            // Залежно від налаштувань Supabase, після реєстрації може бути авто-вхід
            // або вимога підтвердити email. Поки що просто зберігаємо дані.
            state.isLoggedIn = true;
            state.role = 'client'; 
            state.error = null;
        })
        .addCase(register.rejected, (state, action) => {
            state.error = action.payload;
        })

        // --- LOGIN ---
        .addCase(logIn.fulfilled, (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.session.access_token;
            state.role = action.payload.role;
            state.isLoggedIn = true;
            state.error = null;
        })
        .addCase(logIn.rejected, (state, action) => {
            state.error = action.payload;
        })

        // --- LOGOUT ---
        .addCase(logOut.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isLoggedIn = false;
            state.error = null;
        })

        // --- REFRESH USER ---
        .addCase(refreshUser.pending, (state) => {
            state.isRefreshing = true;
        })
        .addCase(refreshUser.fulfilled, (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.session.access_token;
            state.role = action.payload.role;
            state.isLoggedIn = true;
            state.isRefreshing = false;
        })
        .addCase(refreshUser.rejected, (state) => {
            state.isRefreshing = false;
            // Якщо сесія невалідна - обнуляємо все
            state.user = null;
            state.token = null;
            state.role = null;
            state.isLoggedIn = false;
        })
        .addCase(updateUserProfile.fulfilled, (state, action) => {
      // Оновлюємо дані користувача в стейті
      // Припускаємо, що ви зберігаєте додаткові дані в user або окремому полі profile
            if (state.user) {
                // Оновлюємо метадані або поля, де ви зберігаєте ім'я
                state.user.user_metadata = {
                    ...state.user.user_metadata,
                    full_name: action.payload.full_name,
                    phone: action.payload.phone
                };
            }
        });
    },
});

export const { clearError } = authSlice.actions;
export const authReducer = authSlice.reducer;