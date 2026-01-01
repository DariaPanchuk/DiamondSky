import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient'; 
import css from './AddStoneModal.module.css';

const AddStoneModal = ({ isOpen, onClose, onAdd }) => {
    const [dicts, setDicts] = useState({
        insertTypes: [],
        simpleStones: [],
        diaShapes: [],
        diaSizes: [],
        diaColors: [],
        diaClarities: []
    });

    const [selection, setSelection] = useState({
        insert_type_id: '',
        catalog_stone_id: '',
        dia_shape: '',
        dia_size: '',
        dia_color: '',
        dia_clarity: '',
        quantity: 1
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchDicts = async () => {
            try {
                const [iTypes, sStones, dShapes, dSizes, dColors, dClarities] = await Promise.all([
                    supabase.from('dict_insert_types').select('*').order('sort_order'),
                    supabase.from('catalog_simple_stones').select('*').order('sort_order'),
                    supabase.from('dict_diamond_shapes').select('*').order('sort_order'),
                    supabase.from('dict_diamond_sizes').select('*').order('sort_order'),
                    supabase.from('dict_diamond_colors').select('*').order('sort_order'),
                    supabase.from('dict_diamond_clarity').select('*').order('sort_order'),
                ]);

                setDicts({
                    insertTypes: iTypes.data || [],
                    simpleStones: sStones.data || [],
                    diaShapes: dShapes.data || [],
                    diaSizes: dSizes.data || [],
                    diaColors: dColors.data || [],
                    diaClarities: dClarities.data || [],
                });
            } catch (error) {
                console.error("Error fetching modal dicts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDicts();
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelection(prev => ({ ...prev, [name]: value }));

        if (name === 'insert_type_id') {
            setSelection(prev => ({
                ...prev,
                insert_type_id: value,
                catalog_stone_id: '',
                dia_shape: '', dia_size: '', dia_color: '', dia_clarity: ''
            }));
        }
    };

    const handleAddClick = () => {
        if (!selection.insert_type_id) return alert('Оберіть тип вставки');

        let stoneData = {
            stoneType: selection.insert_type_id === 'diamond' ? 'diamond' : 'simple',
            quantity: Number(selection.quantity),
            price: 0,
            stoneId: selection.catalog_stone_id, 
            diamondParams: {
                shape: selection.dia_shape,
                size: selection.dia_size,
                color: selection.dia_color,
                clarity: selection.dia_clarity
            }
        };

        if (stoneData.stoneType === 'simple') {
            if (!stoneData.stoneId) return alert('Оберіть камінь зі списку');
            const stone = dicts.simpleStones.find(s => s.id === stoneData.stoneId);
            stoneData.price = stone?.price_uah || 0;
        } else {
            if (!selection.dia_shape || !selection.dia_size) return alert('Заповніть параметри діаманта');
            stoneData.price = 0; 
        }

        onAdd(stoneData);

        setSelection({
            insert_type_id: '', catalog_stone_id: '', 
            dia_shape: '', dia_size: '', dia_color: '', dia_clarity: '', quantity: 1
        });
        onClose();
    };

    if (!isOpen) return null;

    const availableSimpleStones = dicts.simpleStones.filter(
        s => s.type_id === selection.insert_type_id && s.stock_quantity > 0
    );

    return (
        <div className={css.overlay}>
            <div className={css.modal}>
                <div className={css.header}>
                    <h3>💎 Додати вставку</h3>
                    <button className={css.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={css.body}>
                    {loading ? <p>Завантаження...</p> : (
                        <>
                            <label className={css.label}>Тип вставки:</label>
                            <select 
                                name="insert_type_id" 
                                value={selection.insert_type_id} 
                                onChange={handleChange} 
                                className={css.select}
                            >
                                <option value="">-- Оберіть тип --</option>
                                {dicts.insertTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>

                            {selection.insert_type_id === 'diamond' && (
                                <div className={css.diamondBox}>
                                    <div className={css.grid2}>
                                        <select name="dia_shape" value={selection.dia_shape} onChange={handleChange} className={css.select}>
                                            <option value="">Форма</option>
                                            {dicts.diaShapes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                        </select>
                                        <select name="dia_size" value={selection.dia_size} onChange={handleChange} className={css.select}>
                                            <option value="">Розмір</option>
                                            {dicts.diaSizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                        </select>
                                        <select name="dia_color" value={selection.dia_color} onChange={handleChange} className={css.select}>
                                            <option value="">Колір</option>
                                            {dicts.diaColors.map(c => <option key={c.id} value={c.id}>{c.id} {c.description}</option>)}
                                        </select>
                                        <select name="dia_clarity" value={selection.dia_clarity} onChange={handleChange} className={css.select}>
                                            <option value="">Чистота</option>
                                            {dicts.diaClarities.map(c => <option key={c.id} value={c.id}>{c.id} {c.description}</option>)}
                                        </select>
                                    </div>
                                    <p className={css.hint}>* Для діаманта ціна буде встановлена як 0 (під запит)</p>
                                </div>
                            )}

                            {selection.insert_type_id && selection.insert_type_id !== 'diamond' && (
                                <div style={{marginTop: '15px'}}>
                                    <label className={css.label}>Оберіть камінь зі складу:</label>
                                    <select 
                                        name="catalog_stone_id" 
                                        value={selection.catalog_stone_id} 
                                        onChange={handleChange} 
                                        className={css.select}
                                    >
                                        <option value="">-- Список варіантів --</option>
                                        
                                        {(() => {
                                            const uniqueNames = [...new Set(availableSimpleStones.map(s => s.name))];
                                            
                                            if (uniqueNames.length === 0) return <option disabled>Немає в наявності</option>;

                                            return uniqueNames.map(groupName => {
                                                const stonesInGroup = availableSimpleStones.filter(s => s.name === groupName);
                                                return (
                                                    <optgroup key={groupName} label={groupName}>
                                                        {stonesInGroup.map(s => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.color !== 'Clear' && s.color !== 'White' ? `${s.color}, ` : ''} 
                                                                {s.shape} {s.size_description} — {s.price_uah} грн
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                );
                                            });
                                        })()}
                                    </select>
                                </div>
                            )}

                            <div className={css.footer}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <label className={css.label} style={{marginBottom:0}}>Кількість:</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        name="quantity"
                                        className={css.qtyInput} 
                                        value={selection.quantity} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <button className={css.addBtn} onClick={handleAddClick}>
                                    Додати
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddStoneModal;