// Отримати весь список
export const selectOrders = (state) => state.orders.items;

// Отримати стан завантаження
export const selectOrdersLoading = (state) => state.orders.isLoading;

// Отримати помилку
export const selectOrdersError = (state) => state.orders.error;

// (Бонус) Селектор для фільтрації: отримати тільки Нові замовлення
export const selectNewOrders = (state) => {
    return state.orders.items.filter(order => order.status === 'new');
};

// (Бонус) Підрахунок загальної суми замовлень клієнта
export const selectTotalOrdersSum = (state) => {
    return state.orders.items.reduce((total, order) => total + (order.total_price || 0), 0);
};

export const selectAvailableServices = (state) => state.orders.availableServices;

export const selectCatalogs = (state) => state.orders.catalogs;