import { createSlice } from '@reduxjs/toolkit';
import { fetchClients, addClient, updateClient, deleteClient } from './operations';

const clientsSlice = createSlice({
    name: 'clients',
    initialState: {
        list: [],
        isLoading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClients.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchClients.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(addClient.pending, (state) => { state.isLoading = true; })
            .addCase(addClient.fulfilled, (state) => { state.isLoading = false; })
            .addCase(addClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateClient.pending, (state) => { state.isLoading = true; })
            .addCase(updateClient.fulfilled, (state) => { state.isLoading = false; })
            .addCase(updateClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(deleteClient.pending, (state) => { state.isLoading = true; })
            .addCase(deleteClient.fulfilled, (state) => { state.isLoading = false; })
            .addCase(deleteClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const clientsReducer = clientsSlice.reducer;