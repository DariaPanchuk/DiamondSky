import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabaseClient';

export const fetchOrders = createAsyncThunk(
    'orders/fetchAll',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const userId = state.auth.user?.id;

            if (!userId) {
                throw new Error('Користувач не авторизований');
            }

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items (
                        *,
                        product_type:dict_product_types (label),
                        metal:dict_metals (label),
                        stones:order_item_stones (
                            id,
                            quantity,
                            price_per_stone,
                            catalog_stone:catalog_simple_stones (name, shape, color, size_description)
                        ),
                        services:order_item_services (
                            id,
                            price,
                            service_dict:dict_additional_services (label)
                        )
                    )
                `)
                .eq('client_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Fetch Orders Error:', error.message);
            return rejectWithValue(error.message);
        }
    }
);

/*
 * СТВОРЕННЯ ЗАМОВЛЕННЯ (З урахуванням таблиці order_item_services)
 */
export const addOrder = createAsyncThunk(
    'orders/addOrder',
    async (payload, { rejectWithValue, getState }) => {
        try {
            const userId = getState().auth.user.id;
            
            // =====================================================
            // ЕТАП 1: ОТРИМАННЯ ДАНИХ ДЛЯ РОЗРАХУНКУ (ЦІНИ)
            // =====================================================
            
            // 1.1. Отримуємо параметри типу виробу (ціна роботи, середня вага)
            const { data: typeData } = await supabase
                .from('dict_product_types')
                .select('base_work_price, avg_weight_g')
                .eq('id', payload.product_type_id)
                .single();

            // 1.2. Отримуємо курс металу
            const { data: metalData } = await supabase
                .from('prices_metals')
                .select('price_per_gram')
                .eq('metal_id', payload.metal_id)
                .single();

            // 1.3. Отримуємо ціни на обрані послуги (якщо є)
            let servicesDict = [];
            if (payload.selected_services && payload.selected_services.length > 0) {
                const { data } = await supabase
                    .from('dict_additional_services')
                    .select('id, price_fixed, price_per_item')
                    .in('id', payload.selected_services);
                servicesDict = data || [];
            }

            // =====================================================
            // ЕТАП 2: МАТЕМАТИКА (РОЗРАХУНОК)
            // =====================================================

            // А. Робота та Метал
            const baseWorkPrice = typeData?.base_work_price || 0;     // Напр. 3500 грн
            const avgWeight = typeData?.avg_weight_g || 0;            // Напр. 3.5 г
            const metalRate = metalData?.price_per_gram || 0;         // Напр. 3200 грн/г
            
            const metalCost = avgWeight * metalRate;                  // Вартість металу

            // Б. Камені
            let stoneCost = 0;
            
            // Якщо обрано камінь з каталогу
            if (payload.catalog_stone_id) {
                stoneCost = payload.catalog_stone_price || 0;
            } 
            // Якщо діамант (Rapaport) - ваша стара логіка
            else if (payload.insert_type_id === 'diamond' && payload.dia_size) {
                 // Тут можна вставити запит до prices_diamonds, як у вас було.
                 // Для спрощення поки поставимо 0 (менеджер перерахує), 
                 // або розкоментуйте ваш старий код запиту до Rapaport.
                    stoneCost = 0; 
            }

            // В. Послуги
            let servicesCost = 0;
            const servicesToInsert = payload.selected_services.map(srvId => {
                const dictInfo = servicesDict.find(d => d.id === srvId);
                const price = dictInfo?.price_fixed || dictInfo?.price_per_item || 0;
                servicesCost += price;
                
                return {
                    service_id: srvId,
                    price: price
                };
            });

            // Г. ЗАГАЛЬНА СУМА
            const estimatedTotal = baseWorkPrice + metalCost + stoneCost + servicesCost;

            // =====================================================
            // ЕТАП 3: ЗАПИС У БАЗУ (ТРАНЗАКЦІЯ)
            // =====================================================

            // 3.0. Формуємо коментар
            let finalComment = payload.comment || '';
            if (payload.techDescription && payload.insert_type_id === 'diamond') {
                finalComment += `\n[ТЕХ. ЗАПИТ]: ${payload.techDescription}`;
            }

            // 3.1. Створення ORDER (Шапка)
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    client_id: userId,
                    status: 'new',
                    deadline: payload.deadline || null,
                    order_comment: finalComment,
                    
                    // ✅ ЗАПИСУЄМО РОЗРАХОВАНУ СУМУ
                    total_price: estimatedTotal, 
                    prepayment: 0,
                    discount_amount: 0
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 3.2. Створення ORDER_ITEM (Виріб)
            const { data: newItem, error: itemError } = await supabase
                .from('order_items')
                .insert([{
                    order_id: newOrder.id,
                    product_type_id: payload.product_type_id,
                    metal_id: payload.metal_id,
                    size: payload.size ? parseFloat(payload.size) : null,
                    
                    // ✅ ЗАПИСУЄМО ДЕТАЛІЗАЦІЮ ЦІНИ
                    weight_g: avgWeight,      // Орієнтовна вага
                    price_work: baseWorkPrice,
                    price_metal: metalCost,
                    price_total: estimatedTotal // (або work + metal, залежно від вашої логіки items)
                }])
                .select()
                .single();

            if (itemError) throw itemError;

            // 3.3. Додавання ПОСЛУГ (з цінами)
            if (servicesToInsert.length > 0) {
                const serviceRows = servicesToInsert.map(s => ({
                    order_item_id: newItem.id, // Прив'язуємо до Items
                    service_id: s.service_id,
                    price: s.price
                }));

                const { error: srvError } = await supabase
                    .from('order_item_services')
                    .insert(serviceRows);
                
                if (srvError) throw srvError;
            }

            // 3.4. Додавання КАМЕНЯ (з ціною)
            if (payload.catalog_stone_id) {
                const { error: stoneError } = await supabase
                    .from('order_item_stones')
                    .insert([{
                        order_item_id: newItem.id,
                        catalog_stone_id: payload.catalog_stone_id,
                        quantity: 1,
                        price_per_stone: stoneCost // ✅ Ціна каменя
                    }]);

                if (stoneError) throw stoneError;

                // Списання зі складу
                await supabase.rpc('decrement_stock', { row_id: payload.catalog_stone_id });
            }

            return newOrder;

        } catch (error) {
            console.error('Add Order Error:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const deleteOrder = createAsyncThunk(
    'orders/deleteOrder',
    async (orderId, { rejectWithValue }) => {
        try {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) return rejectWithValue(error.message);
        return orderId;
        } catch (error) {
        return rejectWithValue(error.message);
        }
    }
);

export const fetchJewelerOrders = createAsyncThunk(
    'orders/fetchJewelerAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    clients (full_name, phone, email),
                    items:order_items (
                        *,
                        product_type:dict_product_types (label),
                        metal:dict_metals (label),
                        stones:order_item_stones (
                            id,
                            quantity,
                            price_per_stone,
                            catalog_stone:catalog_simple_stones (name, shape)
                        ),
                        services:order_item_services (
                            id,
                            price,
                            service_dict:dict_additional_services (label)
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching jeweler orders:', error.message);
            return rejectWithValue(error.message);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'orders/updateStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .update({ status: status }) // Оновлюємо поле status
                .eq('id', orderId)          // Для конкретного ID
                .select()                   // Повертаємо оновлений запис
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// src/redux/orders/operations.js

export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAllAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    clients (full_name, phone, email),
                    items:order_items (
                        *,
                        product_type:dict_product_types (label),
                        metal:dict_metals (label),
                        employees:employees!fk_executor_cascade (full_name),
                        stones:order_item_stones (
                            id, quantity, price_per_stone, description,
                            catalog_stone:catalog_simple_stones (name, shape)
                        ),
                        services:order_item_services (
                            id, price,
                            service_dict:dict_additional_services (label)
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("🔥 SQL Error:", error);
                throw error;
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/*
 * ОНОВЛЕННЯ ЗАМОВЛЕННЯ (АДМІН)
 */
export const updateOrderFull = createAsyncThunk(
    'orders/updateFull',
    async ({ orderId, itemId, updates }, { rejectWithValue }) => {
        try {
            const orderUpdates = {};
            const itemUpdates = {};

            // --- 1. Поля таблиці 'orders' ---
            if (updates.total_price !== undefined) orderUpdates.total_price = updates.total_price;
            if (updates.deadline !== undefined) orderUpdates.deadline = updates.deadline;
            if (updates.order_comment !== undefined) orderUpdates.order_comment = updates.order_comment;
            if (updates.status !== undefined) orderUpdates.status = updates.status;

            // --- 2. Поля таблиці 'order_items' ---
            if (updates.size !== undefined) itemUpdates.size = updates.size;
            if (updates.weight_g !== undefined) itemUpdates.weight_g = updates.weight_g;

            // Оновлення виконавця (executor_id)
            if (updates.employee_id !== undefined) {
                itemUpdates.executor_id = updates.employee_id === '' ? null : updates.employee_id;
            }

            // --- Виконання запитів ---

            // A. Оновлюємо orders
            if (Object.keys(orderUpdates).length > 0) {
                const { error: errOrder } = await supabase
                    .from('orders')
                    .update(orderUpdates)
                    .eq('id', orderId);
                if (errOrder) throw errOrder;
            }

            // B. Оновлюємо order_items
            if (Object.keys(itemUpdates).length > 0 && itemId) {
                const { error: errItem } = await supabase
                    .from('order_items')
                    .update(itemUpdates)
                    .eq('id', itemId);
                if (errItem) throw errItem;
            }

            // C. Отримуємо свіжі дані
            // (Тут теж прибрав коментарі з select)
            const { data: freshOrder, error: fetchError } = await supabase
                .from('orders')
                .select(`
                    *,
                    clients (full_name, phone, email),
                    items:order_items (
                        *,
                        employees:employees!executor_id (full_name),
                        product_type:dict_product_types (label),
                        metal:dict_metals (label),
                        stones:order_item_stones (
                            id, quantity, price_per_stone, description,
                            catalog_stone:catalog_simple_stones (name, shape)
                        ),
                        services:order_item_services (
                            id, price,
                            service_dict:dict_additional_services (label)
                        )
                    )
                `)
                .eq('id', orderId)
                .single();

            if (fetchError) throw fetchError;
            return freshOrder;

        } catch (error) {
            console.error("Update Error:", error);
            return rejectWithValue(error.message);
        }
    }
);

// 1. Отримати довідник послуг (щоб наповнити випадаючий список)
export const fetchServicesDictionary = createAsyncThunk(
    'orders/fetchServicesDict',
    async (_, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('dict_additional_services')
                .select('*');
            if (error) throw error;
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2. Додати послугу до виробу
export const addServiceToItem = createAsyncThunk(
    'orders/addService',
    async ({ itemId, serviceId, price }, { dispatch, rejectWithValue }) => {
        try {
            const { error } = await supabase
                .from('order_item_services')
                .insert({
                    order_item_id: itemId,
                    service_id: serviceId,
                    price: price
                });

            if (error) throw error;

            // Після додавання оновлюємо список замовлень, щоб побачити зміни
            dispatch(fetchAllOrders()); 
            return;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 3. Видалити послугу
export const deleteServiceFromItem = createAsyncThunk(
    'orders/deleteService',
    async ({ serviceRecordId }, { dispatch, rejectWithValue }) => {
        try {
            const { error } = await supabase
                .from('order_item_services')
                .delete()
                .eq('id', serviceRecordId); // Видаляємо конкретний запис зв'язку

            if (error) throw error;

            dispatch(fetchAllOrders());
            return;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchStoneCatalogs = createAsyncThunk(
    'catalogs/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data: simpleData, error } = await supabase
                .from('catalog_simple_stones')
                .select('*');

            if (error) throw error;

            return {
                simple: simpleData,
                diamonds: [] 
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2. Додати камінь до виробу
export const addStoneToItem = createAsyncThunk(
    'orders/addStone',
    async ({ itemId, stoneType, stoneId, quantity, price, diamondParams }, { dispatch, rejectWithValue }) => {
        try {
            const insertData = {
                order_item_id: itemId,
                quantity: quantity,
                price_per_stone: price || 0,
                catalog_stone_id: null, 
                warehouse_diamond_id: null,
                description: null,
            };

            if (stoneType === 'diamond' && diamondParams) {
                // ЛОГІКА ДЛЯ ДІАМАНТА (КОНСТРУКТОР)
                // Ми не прив'язуємось до ID, ми просто описуємо, що треба замовити
                insertData.description = `Діамант: ${diamondParams.shape}, ${diamondParams.size}, ${diamondParams.color}/${diamondParams.clarity}`;
            } 
            else {
                // ЛОГІКА ДЛЯ ЗВИЧАЙНОГО КАМЕНЯ
                // Тут ми маємо ID з каталогу
                insertData.catalog_stone_id = stoneId;
            }

            const { error } = await supabase
                .from('order_item_stones')
                .insert(insertData);

            if (error) throw error;

            dispatch(fetchAllOrders());
            return;
        } catch (error) {
            console.error("Add stone error:", error);
            return rejectWithValue(error.message);
        }
    }
);

// 3. Видалити камінь
export const deleteStoneFromItem = createAsyncThunk(
    'orders/deleteStone',
    async ({ stoneRecordId }, { dispatch, rejectWithValue }) => {
        try {
            const { error } = await supabase
                .from('order_item_stones')
                .delete()
                .eq('id', stoneRecordId);

            if (error) throw error;

            dispatch(fetchAllOrders());
            return;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);