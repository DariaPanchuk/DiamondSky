import { createSlice } from '@reduxjs/toolkit';
import { fetchOrders, addOrder, deleteOrder, fetchJewelerOrders, updateOrderStatus, updateOrderFull, fetchAllOrders, fetchServicesDictionary, fetchStoneCatalogs } from './operations';

const initialState = {
    items: [],
    availableServices: [],
    catalogs: {
        simple: [],
        diamonds: []
    },
    isLoading: false, 
    error: null,      
};

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrders: (state) => {
        state.items = [];
        state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // --- ADD ORDER ---
            .addCase(addOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items.unshift(action.payload);
            })
            .addCase(addOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(deleteOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = state.items.filter(order => order.id !== action.payload);
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchJewelerOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.items = []; 
            })
            .addCase(fetchJewelerOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.items = action.payload;
            })
            .addCase(fetchJewelerOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const index = state.items.findIndex(order => order.id === action.payload.id);
                if (index !== -1) {
                    state.items[index].status = action.payload.status;
                }
            })
            .addCase(updateOrderFull.fulfilled, (state, action) => {
                const index = state.items.findIndex(order => order.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(fetchAllOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchServicesDictionary.fulfilled, (state, action) => {
                state.availableServices = action.payload;
            })
            .addCase(fetchStoneCatalogs.fulfilled, (state, action) => {
                state.catalogs = action.payload;
            });
    },
});

export const { clearOrders } = ordersSlice.actions;
export const ordersReducer = ordersSlice.reducer;