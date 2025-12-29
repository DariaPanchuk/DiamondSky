import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../../config/supabaseClient';
import css from './Warehouse.module.css';

const Warehouse = () => {
    const employeeId = useSelector(state => state.auth.user.id);
    const [activeTab, setActiveTab] = useState('metals'); 
    const [loading, setLoading] = useState(true);

    // === ДАНІ ===
    const [metalsInventory, setMetalsInventory] = useState([]);
    const [diamondsInventory, setDiamondsInventory] = useState([]);
    const [simpleStonesInventory, setSimpleStonesInventory] = useState([]);

    const [dicts, setDicts] = useState({ 
        metals: [], shapes: [], colors: [], clarities: [] 
    });

    // === ФОРМИ ===
    const [metalOp, setMetalOp] = useState({
        metal_id: '', amount: '', operation_type: 'supply', description: ''
    });

    const [newDiamond, setNewDiamond] = useState({
        shape_id: 'round', weight: 0.5, color_id: 'H', clarity_id: 'SI1',
        cut: 'Excellent', certificate_number: '', purchase_price_usd: 0
    });

    const [simpleOp, setSimpleOp] = useState({
        stone_id: '', quantity: '', operation_type: 'supply', description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

const fetchData = async () => {
        setLoading(true);
        try {
            // --- 1. МЕТАЛИ (Нова логіка: Довідник + Склад) ---
            // А. Беремо всі можливі метали з довідника
            const { data: allMetalsDict } = await supabase
                .from('dict_metals')
                .select('*')
                .order('label');

            // Б. Беремо поточні залишки зі складу
            const { data: warehouseStock } = await supabase
                .from('warehouse_metals')
                .select('*');

            // В. Об'єднуємо: якщо металу немає на складі, ставимо 0
            const mergedMetals = allMetalsDict.map(dictMetal => {
                const stockRecord = warehouseStock.find(w => w.metal_id === dictMetal.id);
                return {
                    metal_id: dictMetal.id,
                    balance_g: stockRecord ? stockRecord.balance_g : 0, // Якщо запису немає — 0
                    dict_metals: { 
                        label: dictMetal.label, 
                        probe: dictMetal.probe 
                    }
                };
            });

            // --- 2. ДІАМАНТИ ---
            const { data: dData } = await supabase.from('warehouse_diamonds').select('*').eq('status', 'available').order('created_at', { ascending: false });

            // --- 3. ПРОСТІ КАМЕНІ ---
            const { data: sData } = await supabase
                .from('catalog_simple_stones')
                .select('*')
                .order('stock_quantity', { ascending: false });

            // --- 4. ДОВІДНИКИ (Для випадаючих списків) ---
            const [shp, col, clr] = await Promise.all([
                supabase.from('dict_diamond_shapes').select('*'),
                supabase.from('dict_diamond_colors').select('*'),
                supabase.from('dict_diamond_clarity').select('*'),
            ]);

            // ЗБЕРІГАЄМО В СТЕЙТ
            setMetalsInventory(mergedMetals || []); 
            setDiamondsInventory(dData || []);
            setSimpleStonesInventory(sData || []);
            
            setDicts({
                metals: allMetalsDict || [], 
                shapes: shp.data || [],
                colors: col.data || [],
                clarities: clr.data || []
            });

            // Дефолтні значення для форм
            if (allMetalsDict?.[0]) setMetalOp(prev => ({ ...prev, metal_id: allMetalsDict[0].id }));
            if (sData?.[0]) setSimpleOp(prev => ({ ...prev, stone_id: sData[0].id }));

        } catch (error) {
            console.error(error);
            alert('Помилка завантаження даних');
        } finally {
            setLoading(false);
        }
    };

    // --- ОПЕРАЦІЇ З МЕТАЛАМИ ---
    const handleMetalOperation = async (e) => {
        e.preventDefault();
        const amount = parseFloat(metalOp.amount);
        if (!amount || amount <= 0) return alert("Некоректна вага");

        try {
            const isPositive = ['supply', 'scrap_in', 'return'].includes(metalOp.operation_type);
            const change = isPositive ? amount : -amount;

            // 1. Записуємо в ЛОГ
            await supabase.from('warehouse_log').insert([{
                employee_id: employeeId, 
                resource_type: 'metal', 
                resource_id: metalOp.metal_id,
                amount_change: change, 
                operation_type: metalOp.operation_type, 
                description: metalOp.description
            }]);

            // 2. ОНОВЛЮЄМО БАЛАНС (UPSERT)
            // Знаходимо поточний баланс у нашому списку (там вже є 0, якщо запису немає)
            const currentMetal = metalsInventory.find(m => m.metal_id === metalOp.metal_id);
            const currentBalance = currentMetal ? currentMetal.balance_g : 0;
            const newBalance = currentBalance + change;

            if (newBalance < 0) return alert("Недостатньо металу на складі!");

            // Використовуємо UPSERT: Створить запис, якщо його немає, або оновить, якщо є
            const { error } = await supabase.from('warehouse_metals').upsert({ 
                metal_id: metalOp.metal_id,
                balance_g: newBalance,
                updated_at: new Date() 
            });

            if (error) throw error;

            alert('Успішно!');
            setMetalOp({ ...metalOp, amount: '', description: '' });
            fetchData(); // Оновлюємо таблицю
        } catch (err) { 
            console.error(err);
            alert(err.message); 
        }
    };

    // --- ОПЕРАЦІЇ З ПРОСТИМИ КАМЕНЯМИ ---
    const handleSimpleStoneOperation = async (e) => {
        e.preventDefault();
        const qty = parseInt(simpleOp.quantity);
        if (!qty || qty <= 0) return alert("Некоректна кількість");

        try {
            const isPositive = ['supply', 'return'].includes(simpleOp.operation_type);
            const change = isPositive ? qty : -qty;

            // Лог
            await supabase.from('warehouse_log').insert([{
                employee_id: employeeId,
                resource_type: 'simple_stone',
                resource_id: simpleOp.stone_id,
                amount_change: change,
                operation_type: simpleOp.operation_type,
                description: simpleOp.description
            }]);

            // Оновлення балансу
            const currentStone = simpleStonesInventory.find(s => s.id === simpleOp.stone_id);
            const currentQty = currentStone?.stock_quantity || 0;
            const newQty = currentQty + change;

            if (newQty < 0) return alert("Недостатньо каменів на складі!");

            await supabase
                .from('catalog_simple_stones')
                .update({ stock_quantity: newQty })
                .eq('id', simpleOp.stone_id);

            alert('Баланс оновлено!');
            setSimpleOp({ ...simpleOp, quantity: '', description: '' });
            fetchData();
        } catch (err) { alert(err.message); }
    };

    // --- ДОДАВАННЯ ДІАМАНТА ---
    const handleAddDiamond = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('warehouse_diamonds').insert([{...newDiamond, status: 'available'}]);
        if (error) alert(error.message);
        else { alert('Діамант додано!'); fetchData(); }
    };

    // --- ВИДАЛЕННЯ ДІАМАНТА ---
    const handleDeleteDiamond = async (id) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей діамант?')) return;

        try {
            const { error } = await supabase
                .from('warehouse_diamonds')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('Діамант видалено');
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <div className={css.loading}>Завантаження складу...</div>;

    return (
        <div className={css.container}>
            <div className={css.tabsWrapper}>
                <button 
                    onClick={() => setActiveTab('metals')} 
                    className={`${css.tab} ${activeTab === 'metals' ? css.activeTab : ''}`}
                >
                    Метали
                </button>
                <button 
                    onClick={() => setActiveTab('diamonds')} 
                    className={`${css.tab} ${activeTab === 'diamonds' ? css.activeTab : ''}`}
                >
                    Діаманти
                </button>
                <button 
                    onClick={() => setActiveTab('simple')} 
                    className={`${css.tab} ${activeTab === 'simple' ? css.activeTab : ''}`}
                >
                    Інші камені
                </button>
            </div>

            {/* === 1. МЕТАЛИ === */}
            {activeTab === 'metals' && (
                <div className={css.gridContainer}>
                    <div>
                        <h3 className={css.title}>Наявність</h3>
                        <table className={css.table}>
                            <thead className={css.trHead}><tr><th>Метал</th><th>Залишок (г)</th></tr></thead>
                            <tbody>
                                {metalsInventory.map(m => (
                                    <tr key={m.metal_id} className={css.trBody}>
                                        <td>{m.dict_metals.label} <small>({m.dict_metals.probe})</small></td>
                                        <td 
                                            className={css.balanceText}
                                            style={{ color: m.balance_g < 10 ? 'red' : 'green' }}
                                        >
                                            {m.balance_g.toFixed(2)} г
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={css.card}>
                        <h4 className={css.title}>Операція з металом</h4>
                        <form onSubmit={handleMetalOperation} className={css.form}>
                            <select value={metalOp.metal_id} onChange={e => setMetalOp({...metalOp, metal_id: e.target.value})} className={css.input}>
                                {dicts.metals.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                            </select>
                            <select value={metalOp.operation_type} onChange={e => setMetalOp({...metalOp, operation_type: e.target.value})} className={css.input}>
                                <option value="supply">Поставка</option>
                                <option value="scrap_in">Прийом брухту</option>
                                <option value="production">Видача в роботу</option>
                                <option value="loss">Втрати</option>
                            </select>
                            <input type="number" step="0.01" value={metalOp.amount} onChange={e => setMetalOp({...metalOp, amount: e.target.value})} placeholder="Вага (г)" className={css.input} />
                            <input type="text" value={metalOp.description} onChange={e => setMetalOp({...metalOp, description: e.target.value})} placeholder="Коментар" className={css.input} />
                            <button type="submit" className={css.btnPrimary}>Провести</button>
                        </form>
                    </div>
                </div>
            )}

            {/* === 2. ПРОСТІ КАМЕНІ === */}
            {activeTab === 'simple' && (
                <div className={css.gridContainer}>
                    <div>
                        <h3 className={css.title}>Наявність</h3>
                        <div className={css.tableScroll}>
                            <table className={css.table}>
                                <thead className={css.trHead}><tr><th>Камінь</th><th>Характеристики</th><th>Кількість</th></tr></thead>
                                <tbody>
                                    {simpleStonesInventory.map(s => (
                                        <tr key={s.id} className={css.trBody}>
                                            <td><b>{s.name}</b></td>
                                            <td style={{fontSize:'0.9em'}}>
                                                {s.shape} {s.size_description} <br/>
                                                <span style={{color: '#666'}}>{s.color}</span>
                                            </td>
                                            <td>
                                                <span 
                                                    className={css.stockBadge}
                                                    style={{ 
                                                        background: s.stock_quantity > 0 ? '#e8f5e9' : '#ffebee', 
                                                        color: s.stock_quantity > 0 ? 'green' : 'red'
                                                    }}
                                                >
                                                    {s.stock_quantity} шт
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={css.card}>
                        <h4 className={css.title}>Операція з каменями</h4>
                        <form onSubmit={handleSimpleStoneOperation} className={css.form}>
                            <label>Оберіть камінь:</label>
                            <select value={simpleOp.stone_id} onChange={e => setSimpleOp({...simpleOp, stone_id: e.target.value})} className={css.input}>
                                {simpleStonesInventory.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} | {s.shape} {s.size_description} ({s.color})
                                    </option>
                                ))}
                            </select>

                            <label>Тип дії:</label>
                            <select value={simpleOp.operation_type} onChange={e => setSimpleOp({...simpleOp, operation_type: e.target.value})} className={css.input}>
                                <option value="supply">Поставка (Купили партію)</option>
                                <option value="production">Видача (Вставили у виріб)</option>
                                <option value="loss">Бій / Брак</option>
                                <option value="return">Повернення</option>
                            </select>

                            <label>Кількість:</label>
                            <input type="number" step="1" value={simpleOp.quantity} onChange={e => setSimpleOp({...simpleOp, quantity: e.target.value})} placeholder="Штук" className={css.input} />
                            
                            <label>Коментар:</label>
                            <input type="text" value={simpleOp.description} onChange={e => setSimpleOp({...simpleOp, description: e.target.value})} placeholder="Причина..." className={css.input} />

                            <button type="submit" className={css.btnPrimary}>Оновити залишок</button>
                        </form>
                    </div>
                </div>
            )}

            {/* === 3. ДІАМАНТИ === */}
            {activeTab === 'diamonds' && (
                <div>
                    <div className={css.card} style={{ marginBottom: '20px' }}>
                        <h4 className={css.title}>Додати GIA діамант</h4>
                        <form onSubmit={handleAddDiamond} className={css.diamondForm}>
                            <select value={newDiamond.shape_id} onChange={e => setNewDiamond({...newDiamond, shape_id: e.target.value})} className={css.input}>
                                {dicts.shapes.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                            </select>
                            <input type="number" step="0.01" placeholder="Carat" value={newDiamond.weight} onChange={e => setNewDiamond({...newDiamond, weight: e.target.value})} className={css.input} style={{width: '80px'}} />
                            <select value={newDiamond.color_id} onChange={e => setNewDiamond({...newDiamond, color_id: e.target.value})} className={css.input} style={{width: '60px'}}>
                                {dicts.colors.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                            </select>
                            <select value={newDiamond.clarity_id} onChange={e => setNewDiamond({...newDiamond, clarity_id: e.target.value})} className={css.input} style={{width: '70px'}}>
                                {dicts.clarities.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                            </select>
                            <input type="text" placeholder="Cert Number" value={newDiamond.certificate_number} onChange={e => setNewDiamond({...newDiamond, certificate_number: e.target.value})} className={css.input} style={{flex: 1}} />
                            <button type="submit" className={css.btnPrimary}>+ Додати</button>
                        </form>
                    </div>
                    <table className={css.table}>
                        <thead className={css.trHead}>
                            <tr>
                                <th>ID</th>
                                <th>Характеристики</th>
                                <th>Сертифікат</th>
                                <th>Ціна закупки</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {diamondsInventory.map(d => (
                                <tr key={d.id} className={css.trBody}>
                                    <td><small>{d.id.slice(0, 6)}</small></td>
                                    <td>{d.shape_id} <b>{d.weight}ct</b> {d.color_id}/{d.clarity_id}</td>
                                    <td>{d.certificate_number || '-'}</td>
                                    <td style={{color: 'green'}}>${d.purchase_price_usd}</td>
                                    <td>
                                        <button 
                                            className={css.btnDelete} 
                                            onClick={() => handleDeleteDiamond(d.id)}
                                        >
                                            Видалити
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Warehouse;