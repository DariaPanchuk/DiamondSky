export const selectUser = (state) => state.auth.user;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

export const selectUserRole = (state) => state.auth.role;

export const selectIsRefreshing = (state) => state.auth.isRefreshing;

export const selectAuthError = (state) => state.auth.error;

export const selectIsEmployee = (state) => {
    const role = state.auth.role;
    return role && role !== 'client';
};