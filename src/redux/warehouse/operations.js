import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabaseClient';

// --- ОТРИМАННЯ ВСІХ ДАНИХ СКЛАДУ ---
export const fetchWarehouseData = createAsyncThunk(
    'warehouse/fetchAll',
    async (_, thunkAPI) => {
        try {
        // 1. Метали: Dictionary + Stock merge
        const { data: allMetalsDict } = await supabase.from('dict_metals').select('*').order('label');
        const { data: warehouseStock } = await supabase.from('warehouse_metals').select('*');

        const mergedMetals = allMetalsDict.map(dictMetal => {
            const stockRecord = warehouseStock.find(w => w.metal_id === dictMetal.id);
            return {
            metal_id: dictMetal.id,
            balance_g: stockRecord ? stockRecord.balance_g : 0,
            dict_metals: { label: dictMetal.label, probe: dictMetal.probe }
            };
        });

        // 2. Інші запити паралельно
        const [diamondsRes, simpleRes, shapesRes, colorsRes, claritiesRes] = await Promise.all([
            supabase.from('warehouse_diamonds').select('*').eq('status', 'available').order('created_at', { ascending: false }),
            supabase.from('catalog_simple_stones').select('*').order('stock_quantity', { ascending: false }),
            supabase.from('dict_diamond_shapes').select('*'),
            supabase.from('dict_diamond_colors').select('*'),
            supabase.from('dict_diamond_clarity').select('*'),
        ]);

        return {
            metals: mergedMetals,
            diamonds: diamondsRes.data || [],
            simpleStones: simpleRes.data || [],
            dicts: {
                metals: allMetalsDict || [],
                shapes: shapesRes.data || [],
                colors: colorsRes.data || [],
                clarities: claritiesRes.data || []
            }
        };
        } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// --- ОПЕРАЦІЯ З МЕТАЛОМ ---
export const operateMetal = createAsyncThunk(
    'warehouse/operateMetal',
    async ({ metalOp, employeeId, currentInventory }, thunkAPI) => {
        try {
            const amount = parseFloat(metalOp.amount);
            const isPositive = ['supply', 'scrap_in', 'return'].includes(metalOp.operation_type);
            const change = isPositive ? amount : -amount;

            // 1. Лог
            await supabase.from('warehouse_log').insert([{
                employee_id: employeeId,
                resource_type: 'metal',
                resource_id: metalOp.metal_id,
                amount_change: change,
                operation_type: metalOp.operation_type,
                description: metalOp.description
            }]);

            // 2. Рахуємо новий баланс
            const currentMetal = currentInventory.find(m => m.metal_id === metalOp.metal_id);
            const currentBalance = currentMetal ? currentMetal.balance_g : 0;
            const newBalance = currentBalance + change;

            if (newBalance < 0) return thunkAPI.rejectWithValue("Недостатньо металу на складі!");

            // 3. Оновлюємо базу
            const { data, error } = await supabase.from('warehouse_metals')
                .upsert({ 
                    metal_id: metalOp.metal_id, 
                    balance_g: newBalance, 
                    updated_at: new Date() 
                })
                .select();

            if (error) throw error;
            
            // Повертаємо оновлений запис, щоб оновити Redux без повного перезавантаження
            return {
                metal_id: data[0].metal_id, 
                newBalance: data[0].balance_g
            }; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// --- ОПЕРАЦІЯ З КАМЕНЯМИ ---
export const operateSimpleStone = createAsyncThunk(
    'warehouse/operateSimpleStone',
    async ({ simpleOp, employeeId, currentInventory }, thunkAPI) => {
        try {
            const qty = parseInt(simpleOp.quantity);
            const isPositive = ['supply', 'return'].includes(simpleOp.operation_type);
            const change = isPositive ? qty : -qty;

            await supabase.from('warehouse_log').insert([{
                employee_id: employeeId,
                resource_type: 'simple_stone',
                resource_id: simpleOp.stone_id,
                amount_change: change,
                operation_type: simpleOp.operation_type,
                description: simpleOp.description
            }]);

            const currentStone = currentInventory.find(s => s.id === simpleOp.stone_id);
            const currentQty = currentStone?.stock_quantity || 0;
            const newQty = currentQty + change;

            if (newQty < 0) return thunkAPI.rejectWithValue("Недостатньо каменів на складі!");

            const { error } = await supabase
                .from('catalog_simple_stones')
                .update({ stock_quantity: newQty })
                .eq('id', simpleOp.stone_id);

            if (error) throw error;

            return { stone_id: simpleOp.stone_id, newQty };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// --- ДІАМАНТИ (CRUD) ---
export const addDiamond = createAsyncThunk(
    'warehouse/addDiamond',
    async (diamondData, thunkAPI) => {
        try {
            const { data, error } = await supabase
                .from('warehouse_diamonds')
                .insert([{...diamondData, status: 'available'}])
                .select();
            if (error) throw error;
            return data[0]; // Повертаємо створений діамант
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const deleteDiamond = createAsyncThunk(
    'warehouse/deleteDiamond',
    async (id, thunkAPI) => {
        try {
            const { error } = await supabase.from('warehouse_diamonds').delete().eq('id', id);
            if (error) throw error;
            return id; // Повертаємо ID для видалення зі стейту
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);