import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import css from './Warehouse.module.css';
import { 
    fetchWarehouseData, 
    operateMetal, 
    operateSimpleStone, 
    addDiamond, 
    deleteDiamond 
} from '../../redux/warehouse/operations';
import { 
    selectWarehouseMetals, 
    selectWarehouseDiamonds, 
    selectWarehouseSimpleStones, 
    selectWarehouseDicts, 
    selectWarehouseLoading 
} from '../../redux/warehouse/selectors';

const Warehouse = () => {
    const dispatch = useDispatch();
    const employeeId = useSelector(state => state.auth.user.id);
    const [activeTab, setActiveTab] = useState('metals');
    const metalsInventory = useSelector(selectWarehouseMetals);
    const diamondsInventory = useSelector(selectWarehouseDiamonds);
    const simpleStonesInventory = useSelector(selectWarehouseSimpleStones);
    const dicts = useSelector(selectWarehouseDicts);
    const loading = useSelector(selectWarehouseLoading);
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
        dispatch(fetchWarehouseData());
    }, [dispatch]);

    const handleMetalOperation = (e) => {
        e.preventDefault();
        
        const actualMetalId = metalOp.metal_id || dicts.metals?.[0]?.id;

        if (!actualMetalId) return alert("Список металів порожній або не завантажився!");
        if (!metalOp.amount || parseFloat(metalOp.amount) <= 0) return alert("Некоректна вага");

        dispatch(operateMetal({
            metalOp: { ...metalOp, metal_id: actualMetalId },
            employeeId,
            currentInventory: metalsInventory
        }))
            .unwrap()
            .then(() => {
                alert('Успішно!');
                setMetalOp({ ...metalOp, amount: '', description: '' });
            })
            .catch(err => alert(err));
    };

    const handleSimpleStoneOperation = (e) => {
        e.preventDefault();

        const actualStoneId = simpleOp.stone_id || simpleStonesInventory?.[0]?.id;

        if (!actualStoneId) return alert("Немає каменів на складі!");
        if (!simpleOp.quantity || parseInt(simpleOp.quantity) <= 0) return alert("Некоректна кількість");

        dispatch(operateSimpleStone({
            simpleOp: { ...simpleOp, stone_id: actualStoneId },
            employeeId,
            currentInventory: simpleStonesInventory
        }))
            .unwrap()
            .then(() => {
                alert('Баланс оновлено!');
                setSimpleOp({ ...simpleOp, quantity: '', description: '' });
            })
            .catch(err => alert(err));
    };

    const handleAddDiamond = (e) => {
        e.preventDefault();

        const actualShape = newDiamond.shape_id || dicts.shapes?.[0]?.id || 'round';
        const actualColor = newDiamond.color_id || dicts.colors?.[0]?.id || 'H';
        const actualClarity = newDiamond.clarity_id || dicts.clarities?.[0]?.id || 'SI1';

        dispatch(addDiamond({
            ...newDiamond,
            shape_id: actualShape,
            color_id: actualColor,
            clarity_id: actualClarity
        }))
            .unwrap()
            .then(() => alert('Діамант додано!'))
            .catch(err => alert(err));
    };

    const handleDeleteDiamond = (id) => {
        if (!window.confirm('Ви впевнені?')) return;
        dispatch(deleteDiamond(id))
            .unwrap()
            .then(() => alert('Видалено'))
            .catch(err => alert(err));
    };

    if (loading && metalsInventory.length === 0) return <div className={css.loading}>Завантаження складу...</div>;

    return (
        <div className={css.container}>
            <div className={css.tabsWrapper}>
                <button onClick={() => setActiveTab('metals')} className={`${css.tab} ${activeTab === 'metals' ? css.activeTab : ''}`}>Метали</button>
                <button onClick={() => setActiveTab('diamonds')} className={`${css.tab} ${activeTab === 'diamonds' ? css.activeTab : ''}`}>Діаманти</button>
                <button onClick={() => setActiveTab('simple')} className={`${css.tab} ${activeTab === 'simple' ? css.activeTab : ''}`}>Інші камені</button>
            </div>

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
                                        <td className={css.balanceText} style={{ color: m.balance_g < 10 ? 'red' : 'green' }}>
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
                            <select
                                value={metalOp.metal_id || (dicts.metals?.[0]?.id || '')}
                                onChange={e => setMetalOp({ ...metalOp, metal_id: e.target.value })}
                                className={css.input}
                            >
                                {dicts.metals?.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                            </select>

                            <select value={metalOp.operation_type} onChange={e => setMetalOp({ ...metalOp, operation_type: e.target.value })} className={css.input}>
                                <option value="supply">Поставка</option>
                                <option value="scrap_in">Прийом брухту</option>
                                <option value="production">Видача в роботу</option>
                                <option value="loss">Втрати</option>
                            </select>
                            <input type="number" step="0.01" value={metalOp.amount} onChange={e => setMetalOp({ ...metalOp, amount: e.target.value })} placeholder="Вага (г)" className={css.input} />
                            <input type="text" value={metalOp.description} onChange={e => setMetalOp({ ...metalOp, description: e.target.value })} placeholder="Коментар" className={css.input} />
                            <button type="submit" className={css.btnPrimary} disabled={loading}>Провести</button>
                        </form>
                    </div>
                </div>
            )}

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
                                            <td style={{ fontSize: '0.9em' }}>
                                                {s.shape} {s.size_description} <span style={{ color: '#666' }}>{s.color}</span>
                                            </td>
                                            <td>
                                                <span className={css.stockBadge} style={{ background: s.stock_quantity > 0 ? '#e8f5e9' : '#ffebee', color: s.stock_quantity > 0 ? 'green' : 'red' }}>
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
                            <select
                                value={simpleOp.stone_id || (simpleStonesInventory?.[0]?.id || '')}
                                onChange={e => setSimpleOp({ ...simpleOp, stone_id: e.target.value })}
                                className={css.input}
                            >
                                {simpleStonesInventory?.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} | {s.shape} {s.size_description} ({s.color})</option>
                                ))}
                            </select>

                            <select value={simpleOp.operation_type} onChange={e => setSimpleOp({ ...simpleOp, operation_type: e.target.value })} className={css.input}>
                                <option value="supply">Поставка</option>
                                <option value="production">Видача</option>
                                <option value="loss">Бій / Брак</option>
                                <option value="return">Повернення</option>
                            </select>
                            <input type="number" step="1" value={simpleOp.quantity} onChange={e => setSimpleOp({ ...simpleOp, quantity: e.target.value })} placeholder="Штук" className={css.input} />
                            <input type="text" value={simpleOp.description} onChange={e => setSimpleOp({ ...simpleOp, description: e.target.value })} placeholder="Причина..." className={css.input} />
                            <button type="submit" className={css.btnPrimary} disabled={loading}>Оновити залишок</button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'diamonds' && (
                <div>
                    <div className={css.card} style={{ marginBottom: '20px' }}>
                        <h4 className={css.title}>Додати GIA діамант</h4>
                        <form onSubmit={handleAddDiamond} className={css.diamondForm}>
                            <select
                                value={newDiamond.shape_id || (dicts.shapes?.[0]?.id || '')}
                                onChange={e => setNewDiamond({ ...newDiamond, shape_id: e.target.value })}
                                className={css.input}
                            >
                                {dicts.shapes?.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                            </select>
                            
                            <input type="number" step="0.01" placeholder="Carat" value={newDiamond.weight} onChange={e => setNewDiamond({ ...newDiamond, weight: e.target.value })} className={css.input} style={{ width: '80px' }} />
                            
                            <select
                                value={newDiamond.color_id || (dicts.colors?.[0]?.id || '')}
                                onChange={e => setNewDiamond({ ...newDiamond, color_id: e.target.value })}
                                className={css.input} style={{ width: '60px' }}
                            >
                                {dicts.colors?.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                            </select>

                            <select
                                value={newDiamond.clarity_id || (dicts.clarities?.[0]?.id || '')}
                                onChange={e => setNewDiamond({ ...newDiamond, clarity_id: e.target.value })}
                                className={css.input} style={{ width: '70px' }}
                            >
                                {dicts.clarities?.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                            </select>

                            <input type="text" placeholder="Cert Number" value={newDiamond.certificate_number} onChange={e => setNewDiamond({ ...newDiamond, certificate_number: e.target.value })} className={css.input} style={{ flex: 1 }} />
                            <button type="submit" className={css.btnPrimary} disabled={loading}>+ Додати</button>
                        </form>
                    </div>
                    <table className={css.table}>
                        <thead className={css.trHead}><tr><th>ID</th><th>Характеристики</th><th>Сертифікат</th><th>Ціна</th><th>Дії</th></tr></thead>
                        <tbody>
                            {diamondsInventory.map(d => (
                                <tr key={d.id} className={css.trBody}>
                                    <td><small>{d.id.slice(0, 6)}</small></td>
                                    <td>{d.shape_id} <b>{d.weight}ct</b> {d.color_id}/{d.clarity_id}</td>
                                    <td>{d.certificate_number || '-'}</td>
                                    <td style={{ color: 'green' }}>${d.purchase_price_usd}</td>
                                    <td><button className={css.btnDelete} onClick={() => handleDeleteDiamond(d.id)}>Видалити</button></td>
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