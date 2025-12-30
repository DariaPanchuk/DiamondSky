import { createSlice } from '@reduxjs/toolkit';
import { fetchWarehouseData, operateMetal, operateSimpleStone, addDiamond, deleteDiamond } from './operations';

const initialState = {
    metals: [],
    diamonds: [],
    simpleStones: [],
    dicts: { metals: [], shapes: [], colors: [], clarities: [] },
    isLoading: false,
    error: null,
};

const warehouseSlice = createSlice({
    name: 'warehouse',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        // Fetch Data
        .addCase(fetchWarehouseData.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchWarehouseData.fulfilled, (state, action) => {
            state.isLoading = false;
            state.metals = action.payload.metals;
            state.diamonds = action.payload.diamonds;
            state.simpleStones = action.payload.simpleStones;
            state.dicts = action.payload.dicts;
        })
        .addCase(fetchWarehouseData.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // Metal Operation (Оптимістичне оновлення)
        .addCase(operateMetal.fulfilled, (state, action) => {
            const { metal_id, newBalance } = action.payload;
            const metal = state.metals.find(m => m.metal_id === metal_id);
            if (metal) metal.balance_g = newBalance;
        })

        // Simple Stone Operation
        .addCase(operateSimpleStone.fulfilled, (state, action) => {
            const { stone_id, newQty } = action.payload;
            const stone = state.simpleStones.find(s => s.id === stone_id);
            if (stone) stone.stock_quantity = newQty;
        })

        // Diamond Actions
        .addCase(addDiamond.fulfilled, (state, action) => {
            state.diamonds.unshift(action.payload);
        })
        .addCase(deleteDiamond.fulfilled, (state, action) => {
            state.diamonds = state.diamonds.filter(d => d.id !== action.payload);
        });
    },
});

export const warehouseReducer = warehouseSlice.reducer;