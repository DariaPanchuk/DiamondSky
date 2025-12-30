import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth/slice';
import { ordersReducer } from './orders/slice';
import { employeesReducer } from './employees/slice';
import { clientsReducer } from './clients/slice';
import { warehouseReducer } from './warehouse/slice';

export const store = configureStore({
    reducer: {
      auth: authReducer,
      orders: ordersReducer,
      employees: employeesReducer,
      clients: clientsReducer,
      warehouse: warehouseReducer,
    },
});