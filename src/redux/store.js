import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth/slice';
import { ordersReducer } from './orders/slice';
import { employeesReducer } from './employees/slice';
import { clientsReducer } from './clients/slice';

export const store = configureStore({
    reducer: {
      auth: authReducer,
      orders: ordersReducer,
      employees: employeesReducer,
      clients: clientsReducer,
        // Сюди ми пізніше додамо інші редюсери, наприклад:
        // orders: ordersReducer,
        // products: productsReducer,
    },
  // Redux Toolkit автоматично додає thunk middleware та перевірки devtools
});