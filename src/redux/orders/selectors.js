export const selectOrders = (state) => state.orders.items;

export const selectOrdersLoading = (state) => state.orders.isLoading;

export const selectOrdersError = (state) => state.orders.error;

export const selectNewOrders = (state) => {
    return state.orders.items.filter(order => order.status === 'new');
};

export const selectTotalOrdersSum = (state) => {
    return state.orders.items.reduce((total, order) => total + (order.total_price || 0), 0);
};

export const selectAvailableServices = (state) => state.orders.availableServices;

export const selectCatalogs = (state) => state.orders.catalogs;