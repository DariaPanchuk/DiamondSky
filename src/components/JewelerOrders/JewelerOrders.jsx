import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJewelerOrders, updateOrderStatus } from '../../redux/orders/operations'; 
import { selectOrders, selectOrdersLoading } from '../../redux/orders/selectors';
import css from './JewelerOrders.module.css';

const ORDER_STATUSES = [
    { value: 'new', label: 'Нове' },
    { value: 'modeling', label: '3D Моделювання' },
    { value: 'casting', label: 'Лиття' },
    { value: 'setting', label: 'Закріпка' },
    { value: 'done', label: 'Готово' },
    { value: 'issued', label: 'Видано' }
];

const JewelerOrders = () => {
    const dispatch = useDispatch();
    const orders = useSelector(selectOrders);
    const loading = useSelector(selectOrdersLoading);

    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [statusToUpdate, setStatusToUpdate] = useState('');

    useEffect(() => {
        dispatch(fetchJewelerOrders());
    }, [dispatch]);

    const toggleOrder = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleSaveStatus = (orderId) => {
        dispatch(updateOrderStatus({ orderId, status: statusToUpdate }));
        alert(`Статус змінено на: ${statusToUpdate}`); // Можна замінити на гарний тост
    };

    if (loading) return <div style={{textAlign: 'center', padding: '20px'}}>Завантаження замовлень...</div>;

    if (!orders || orders.length === 0) {
        return <div style={{textAlign: 'center', padding: '40px'}}>Список замовлень порожній.</div>;
    }

    return (
        <div className={css.container}>
            <table className={css.table}>
                <thead>
                    <tr className={css.tableHeader}>
                        <th className={css.th}>№</th>
                        <th className={css.th}>Дата / Дедлайн</th>
                        <th className={css.th}>Клієнт</th> {/* 👈 Нова колонка */}
                        <th className={css.th}>Виріб</th>
                        <th className={css.th}>Бюджет</th>
                        <th className={css.th}>Статус</th>
                        <th className={css.th}></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => {
                        const item = order.items && order.items[0];
                        const isOpen = expandedOrderId === order.id;
                        const productLabel = item?.product_type?.label || 'Виріб';
                        
                        // Дані клієнта
                        const clientName = order.clients?.full_name || 'Гість';
                        const clientPhone = order.clients?.phone || '—';

                        return (
                            <>
                                {/* --- ГОЛОВНИЙ РЯДОК --- */}
                                <tr 
                                    key={order.id} 
                                    onClick={() => toggleOrder(order.id)}
                                    className={isOpen ? css.rowMainActive : css.rowMain}
                                >
                                    <td className={css.tdIndex}>{index + 1}</td>
                                    
                                    <td className={css.td}>
                                        <div>{new Date(order.created_at).toLocaleDateString()}</div>
                                        {order.deadline && (
                                            <div style={{fontSize: '0.8em', color: '#e74c3c'}}>
                                                до {new Date(order.deadline).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>

                                    {/* Інфо про клієнта */}
                                    <td className={css.td}>
                                        <span className={css.clientName}>{clientName}</span>
                                        <span className={css.clientPhone}>{clientPhone}</span>
                                    </td>

                                    <td className={css.tdType}>{productLabel}</td>

                                    <td className={css.td}>
                                        {order.total_price > 0 
                                            ? `${order.total_price.toLocaleString()} грн` 
                                            : '—'}
                                    </td>

                                    <td className={css.td}>
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className={css.arrow}>{isOpen ? '▼' : '▶'}</td>
                                </tr>

                                {/* --- ДЕТАЛІ --- */}
                                {isOpen && (
                                    <tr className={css.rowDetails}>
                                        <td colSpan="7" style={{ padding: '0' }}>
                                            <div className={css.detailsWrapper}>
                                                
                                                {/* ЛІВА: Технічні дані */}
                                                <div>
                                                    <h4 className={css.detailsTitle}>Технічне завдання</h4>
                                                    <ul className={css.detailsList}>
                                                        <li><span className={css.label}>Тип:</span> {productLabel}</li>
                                                        <li><span className={css.label}>Метал:</span> {item?.metal?.label || '—'}</li>
                                                        <li><span className={css.label}>Розмір:</span> {item?.size || '—'}</li>
                                                        <li><span className={css.label}>Вага (розр.):</span> {item?.weight_g} г</li>
                                                        <li>
                                                            <span className={css.label}>Камінь:</span>
                                                            {item?.stones?.[0] 
                                                                ? `${item.stones[0].catalog_stone?.name} (${item.stones[0].catalog_stone?.shape})` 
                                                                : 'Індивідуально / Без каменю'}
                                                        </li>
                                                    </ul>
                                                    {/* 👇 БЛОК ЗМІНИ СТАТУСУ */}
                                                    <div className={css.statusControlBox}>
                                                        <span className={css.label}>Змінити етап:</span>
                                                        <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                                                            <select 
                                                                className={css.statusSelect}
                                                                value={statusToUpdate}
                                                                onChange={(e) => setStatusToUpdate(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()} // Щоб не закривався рядок
                                                            >
                                                                {ORDER_STATUSES.map(s => (
                                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                                ))}
                                                            </select>
                                                            
                                                            <button 
                                                                className={css.btnSave}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSaveStatus(order.id);
                                                                }}
                                                            >
                                                                Зберегти
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ПРАВА: Інфо про замовника та послуги */}
                                                <div>
                                                    <h4 className={css.detailsTitle}>Замовник та Послуги</h4>
                                                    <ul className={css.detailsList}>
                                                        <li><span className={css.label}>ПІБ:</span> {clientName}</li>
                                                        <li><span className={css.label}>Email:</span> {order.clients?.email}</li>
                                                        <li><span className={css.label}>Телефон:</span> {clientPhone}</li>
                                                    </ul>
                                                    
                                                    <div style={{marginTop: '15px'}}>
                                                        <span className={css.label}>Додаткові послуги:</span>
                                                        <div>
                                                            {item?.services?.map((srv, i) => (
                                                                <span key={i} style={{background:'#eee', padding:'2px 6px', borderRadius:'4px', marginRight:'5px', fontSize:'0.85em'}}>
                                                                    {srv.service_dict?.label}
                                                                </span>
                                                            )) || '—'}
                                                        </div>
                                                    </div>

                                                    <div style={{marginTop: '15px'}}>
                                                        <span className={css.label}>Коментар клієнта:</span>
                                                        <p style={{background:'#fff', padding:'8px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'0.9em'}}>
                                                            {order.order_comment || '—'}
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// Бейдж статусу (той самий)
const StatusBadge = ({ status }) => {
    const statusMap = {
        new: 'Нове', modeling: '3D Модель', casting: 'Лиття', 
        setting: 'Закріпка', done: 'Готово', issued: 'Видано'
    };
    const className = `${css.badge} ${css[`status_${status}`] || css.status_default}`;
    return <span className={className}>{statusMap[status] || status}</span>;
};

export default JewelerOrders;