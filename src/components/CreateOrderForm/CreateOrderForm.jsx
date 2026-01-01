import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../../config/supabaseClient';
import { addOrder, fetchOrders } from '../../redux/orders/operations';
import { CATEGORY_GROUPS } from '../../constants';
import css from './CreateOrderForm.module.css';

const INITIAL_SELECTION = {
    product_type_id: '',
    metal_id: '',
    size: '',
    deadline: '',
    comment: '',
    insert_type_id: '',
    catalog_stone_id: '',
    dia_shape: '',
    dia_size: '',
    dia_color: '',
    dia_clarity: '',
    selected_services: []
};

const CreateOrderForm = ({ onSuccess }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [dicts, setDicts] = useState({
        types: [], metals: [], insertTypes: [], simpleStones: [],
        diaShapes: [], diaSizes: [], diaColors: [], diaClarities: [], additionalServices: []
    });

    const [selection, setSelection] = useState(INITIAL_SELECTION);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [types, metals, iTypes, sStones, dShapes, dSizes, dColors, dClarities, addServices] =
                    await Promise.all([
                        supabase.from('dict_product_types').select('*').order('sort_order'),
                        supabase.from('dict_metals').select('*').order('sort_order'),
                        supabase.from('dict_insert_types').select('*').order('sort_order'),
                        supabase.from('catalog_simple_stones').select('*').order('sort_order'),
                        supabase.from('dict_diamond_shapes').select('*').order('sort_order'),
                        supabase.from('dict_diamond_sizes').select('*').order('sort_order'),
                        supabase.from('dict_diamond_colors').select('*').order('sort_order'),
                        supabase.from('dict_diamond_clarity').select('*').order('sort_order'),
                        supabase.from('dict_additional_services').select('*').order('sort_order'),
                    ]);

                setDicts({
                    types: types.data || [], metals: metals.data || [], insertTypes: iTypes.data || [],
                    simpleStones: sStones.data || [], diaShapes: dShapes.data || [], diaSizes: dSizes.data || [],
                    diaColors: dColors.data || [], diaClarities: dClarities.data || [], additionalServices: addServices.data || []
                });
            } catch (error) {
                console.error("Error loading dicts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

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

    const handleServiceChange = (e) => {
        const { value, checked } = e.target;
        setSelection(prev => {
            const current = prev.selected_services || [];
            return {
                ...prev,
                selected_services: checked
                    ? [...current, value]
                    : current.filter(id => id !== value)
            };
        });
    };

    const availableSimpleStones = dicts.simpleStones.filter(
        s => s.type_id === selection.insert_type_id && s.stock_quantity > 0
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        let techDescription = '';
        let stonePrice = 0;

        if (selection.insert_type_id === 'diamond') {
            const shape = dicts.diaShapes.find(s => s.id === selection.dia_shape)?.label;
            const size = dicts.diaSizes.find(s => s.id === selection.dia_size)?.label;
            techDescription = `Запит діаманта: ${shape || ''}, ${size || ''}, ${selection.dia_color}/${selection.dia_clarity}`;
        } 
        else if (selection.catalog_stone_id) {
            const stone = dicts.simpleStones.find(s => s.id === selection.catalog_stone_id);
            if (stone) {
                stonePrice = stone.price_uah;
            }
        }

        const payload = {
            ...selection,
            techDescription,
            catalog_stone_price: stonePrice
        };

        const result = await dispatch(addOrder(payload));
        setSubmitting(false);

        if (addOrder.fulfilled.match(result)) {
            alert('Замовлення створено! 💎');
            setSelection(INITIAL_SELECTION);
            dispatch(fetchOrders());
            if (onSuccess) onSuccess();
        } else {
            alert(`Помилка: ${result.payload}`);
        }
    };

    if (loading) return <div>Завантаження...</div>;

    return (
        <div className={css.container}>
            <h3 className={css.title}>Створити прикрасу</h3>
            
            <form onSubmit={handleSubmit} className={css.form}>
                <div className={css.section}>
                    <h4 className={css.section_title}>Основа</h4>
                    <div className={css.grid2}>
                        <label>
                            <p className={css.label}>Тип виробу:</p>
                            <select name="product_type_id" value={selection.product_type_id} onChange={handleChange} required className={css.input}>
                                <option value="">-- Оберіть --</option>
                                {CATEGORY_GROUPS.map(g => (
                                    <optgroup key={g.id} label={g.label}>
                                        {dicts.types.filter(t => t.category === g.id).map(t =>
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        )}
                                    </optgroup>
                                ))}
                            </select>
                        </label>
                        <label>
                            <p className={css.label}>Метал:</p>
                            <select name="metal_id" value={selection.metal_id} onChange={handleChange} required className={css.input}>
                                <option value="">-- Оберіть --</option>
                                {dicts.metals.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                            </select>
                        </label>
                        <label>
                            <p className={css.label}>Розмір:</p>
                            <input type="number" step="0.5" name="size" value={selection.size} onChange={handleChange} placeholder="17.0" className={css.input} />
                        </label>
                    </div>
                </div>
                <div className={css.section}>
                    <h4 className={css.section_title}>Вставка</h4>
                    <select name="insert_type_id" value={selection.insert_type_id} onChange={handleChange} className={css.input}>
                        <option value="">-- Оберіть тип вставки --</option>
                        {dicts.insertTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>

                    {selection.insert_type_id === 'diamond' && (
                        <div className={css.cop__diamondBox}>
                            <div className={css.grid2}>
                                <select name="dia_shape" value={selection.dia_shape} onChange={handleChange} required className={css.input}>
                                    <option value="">Форма</option>
                                    {dicts.diaShapes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                                <select name="dia_size" value={selection.dia_size} onChange={handleChange} required className={css.input}>
                                    <option value="">Розмір</option>
                                    {dicts.diaSizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                                <select name="dia_color" value={selection.dia_color} onChange={handleChange} required className={css.input}>
                                    <option value="">Колір</option>
                                    {dicts.diaColors.map(c => <option key={c.id} value={c.id}>{c.id} {c.description}</option>)}
                                </select>
                                <select name="dia_clarity" value={selection.dia_clarity} onChange={handleChange} required className={css.input}>
                                    <option value="">Чистота</option>
                                    {dicts.diaClarities.map(c => <option key={c.id} value={c.id}>{c.id} {c.description}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {selection.insert_type_id && selection.insert_type_id !== 'diamond' && (
                        <div style={{ marginTop: '10px' }}>
                            <label><p className={css.label}>Оберіть конкретний камінь:</p></label>
                            <select
                                name="catalog_stone_id"
                                value={selection.catalog_stone_id}
                                onChange={handleChange}
                                required
                                className={`${css.input} ${css.inputTall}`}
                            >
                                <option value="">-- Оберіть варіант --</option>

                                {(() => {
                                    const uniqueNames = [...new Set(availableSimpleStones.map(s => s.name))];
                                    
                                    if (uniqueNames.length === 0) {
                                        return <option disabled>Немає в наявності</option>;
                                    }

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
                </div>

                <div className={css.section}>
                    <h4 className={css.section_title}>Послуги</h4>
                    <div className={css.servicesGrid}>
                        {dicts.additionalServices.map(srv => (
                            <label key={srv.id} className={css.serviceItem}>
                                <input
                                    type="checkbox"
                                    value={srv.id}
                                    checked={selection.selected_services.includes(srv.id)}
                                    onChange={handleServiceChange}
                                    className={css.checkbox}
                                />
                                <span>{srv.label} (+{srv.price_fixed || srv.price_per_item} грн)</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={css.section}>
                    <label><p className={css.section_title}>Коментар:</p></label>
                    <textarea name="comment" value={selection.comment} onChange={handleChange} className={css.textarea} />
                    <label><p className={css.section_title}>Дедлайн:</p></label>
                    <input type="date" name="deadline" value={selection.deadline} onChange={handleChange} className={css.input} />
                </div>

                <button type="submit" disabled={submitting} className={css.submitBtn}>
                    {submitting ? 'Створення...' : 'Замовити'}
                </button>
            </form>
        </div>
    );
};

export default CreateOrderForm;