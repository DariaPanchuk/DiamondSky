// Повертає об'єкт користувача
export const selectUser = (state) => state.auth.user;

// Повертає true/false (чи залогінений)
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

// Повертає роль ('client', 'admin'...)
export const selectUserRole = (state) => state.auth.role;

// Повертає true, якщо додаток ще думає (перевіряє сесію)
export const selectIsRefreshing = (state) => state.auth.isRefreshing;

// Повертає текст помилки (якщо є)
export const selectAuthError = (state) => state.auth.error;

// Допоміжний селектор: Чи це співробітник? (будь-хто крім клієнта)
export const selectIsEmployee = (state) => {
    const role = state.auth.role;
    return role && role !== 'client';
};