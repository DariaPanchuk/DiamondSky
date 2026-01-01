import { createSlice } from '@reduxjs/toolkit';
import { register, logIn, logOut, refreshUser, updateUserProfile } from './operations';

const initialState = {
    user: null,         
    token: null,        
    role: null,         
    isLoggedIn: false,  
    isRefreshing: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
        state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(register.fulfilled, (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true;
            state.role = 'client'; 
            state.error = null;
        })
        .addCase(register.rejected, (state, action) => {
            state.error = action.payload;
        })
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
        .addCase(logOut.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isLoggedIn = false;
            state.error = null;
        })
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
            state.user = null;
            state.token = null;
            state.role = null;
            state.isLoggedIn = false;
        })
        .addCase(updateUserProfile.fulfilled, (state, action) => {
            if (state.user) {
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