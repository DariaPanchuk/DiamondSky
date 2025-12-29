import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchAllOrders, 
    updateOrderFull, 
    fetchServicesDictionary,
    addServiceToItem,
    deleteServiceFromItem,
    fetchStoneCatalogs,
    addStoneToItem,
    deleteStoneFromItem
} from '../../redux/orders/operations';
import { selectOrders, selectOrdersLoading, selectAvailableServices } from '../../redux/orders/selectors';
import { fetchEmployees } from '../../redux/employees/operations';
import { selectEmployeesList } from '../../redux/employees/selectors';
import css from './AllOrders.module.css';
import AddStoneModal from '../../components/AddStoneModa/AddStoneModal'; // Перевірте шлях імпорту!

const ORDER_STATUSES = [
    { value: 'new', label: 'Нове' },
    { value: 'modeling', label: '3D Моделювання' },
    { value: 'casting', label: 'Лиття' },
    { value: 'setting', label: 'Закріпка' },
    { value: 'done', label: 'Готово' },
    { value: 'issued', label: 'Видано' }
];

const AllOrders = () => {
    const dispatch = useDispatch();
    const orders = useSelector(selectOrders);
    const employeesList = useSelector(selectEmployeesList);
    const availableServices = useSelector(selectAvailableServices);
    const loading = useSelector(selectOrdersLoading);

    // --- Стани ---
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);
    
    // Форма редагування
    const [formData, setFormData] = useState({});
    
    // Стани для додавання елементів
    const [newServiceId, setNewServiceId] = useState('');
    const [isStoneModalOpen, setIsStoneModalOpen] = useState(false);
    const [targetItemForStone, setTargetItemForStone] = useState(null);

    useEffect(() => {
        dispatch(fetchAllOrders());
        dispatch(fetchServicesDictionary());
        dispatch(fetchStoneCatalogs());
        dispatch(fetchEmployees());
    }, [dispatch]);

    // --- Логіка перемикання ---
    const toggleOrder = (order) => {
        if (editingOrderId && editingOrderId === order.id) return; // Не закривати, поки редагуємо
        
        if (expandedOrderId === order.id) {
            setExpandedOrderId(null);
            setEditingOrderId(null);
        } else {
            setExpandedOrderId(order.id);
        }
    };

    // --- Логіка Редагування ---
    const startEditing = (order, item) => {
        setEditingOrderId(order.id);
        
        console.log("Current Employee ID:", order.employee_id); // <--- Перевірте в консолі

        setFormData({
            // Якщо employee_id null або undefined, ставимо пустий рядок ''
            employee_id: item?.employee_id || '',
            
            total_price: order.total_price || 0,
            deadline: order.deadline ? order.deadline.split('T')[0] : '',
            order_comment: order.order_comment || '',
            status: order.status,
            size: item?.size || '',
            weight_g: item?.weight_g || '',
        });
    };

    const cancelEditing = () => {
        setEditingOrderId(null);
        setFormData({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (orderId, itemId) => {
        dispatch(updateOrderFull({
            orderId, 
            itemId, 
            updates: formData
        }));
        setEditingOrderId(null);
    };

    // --- Логіка Послуг ---
    const handleAddService = (orderId, itemId) => {
        if (!newServiceId) return;
        
        // Знаходимо послугу в довіднику
        const service = availableServices.find(s => s.id === newServiceId);
        
        // 👇 ВИПРАВЛЕННЯ: беремо price_fixed або price_per_item
        const correctPrice = service?.price_fixed || service?.price_per_item || 0;

        dispatch(addServiceToItem({
            orderId, 
            itemId, 
            serviceId: newServiceId,
            price: correctPrice // Передаємо правильну ціну
        }));
        setNewServiceId('');
    };

    const handleDeleteService = (orderId, serviceRecordId) => {
        if (window.confirm('Видалити цю послугу?')) {
            dispatch(deleteServiceFromItem({ orderId, serviceRecordId }));
        }
    };

    // --- Логіка Каменів ---
    const openStoneModal = (orderId, itemId) => {
        setTargetItemForStone({ orderId, itemId });
        setIsStoneModalOpen(true);
    };

    const handleAddStone = (stoneData) => {
        if (!targetItemForStone) return;
        dispatch(addStoneToItem({
            orderId: targetItemForStone.orderId,
            itemId: targetItemForStone.itemId,
            ...stoneData
        }));
    };

    const handleDeleteStone = (orderId, stoneRecordId) => {
        if (window.confirm('Видалити цей камінь?')) {
            dispatch(deleteStoneFromItem({ orderId, stoneRecordId }));
        }
    };

    // --- Рендер ---
    if (loading) return <div style={{textAlign: 'center', padding: '20px'}}>Завантаження бази...</div>;
    if (!orders || orders.length === 0) return <div style={{textAlign: 'center', padding: '40px'}}>Список порожній.</div>;

    return (
        <div className={css.container}>
            <table className={css.table}>
                <thead>
                    <tr className={css.tableHeader}>
                        <th className={css.th}>№</th>
                        <th className={css.th}>Дата</th>
                        <th className={css.th}>Клієнт</th>
                        <th className={css.th}>Виконавець</th>
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
                        const isEditing = editingOrderId === order.id;

                        // Дані для відображення
                        const productLabel = item?.product_type?.label || 'Виріб';
                        const clientName = order.clients?.full_name || 'Гість';
                        const clientPhone = order.clients?.phone || '—';
                        const employeeName = item?.employees?.full_name || '—';

                        return (
                            <>
                                {/* --- ГОЛОВНИЙ РЯДОК --- */}
                                <tr 
                                    key={order.id} 
                                    onClick={() => toggleOrder(order)}
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

                                    <td className={css.td}>
                                        <span className={css.clientName}>{clientName}</span>
                                        <span className={css.clientPhone}>{clientPhone}</span>
                                    </td>

                                    <td className={css.td} onClick={(e) => isEditing && e.stopPropagation()}>
                                        {isEditing ? (
                                            <select 
                                                name="employee_id" 
                                                className={css.selectField}
                                                value={formData.employee_id} 
                                                onChange={handleInputChange}
                                                style={{width: '100%', minWidth: '120px'}}
                                            >
                                                <option value="">— Не призначено —</option>
                                                {(employeesList || []).map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.full_name} ({emp.role})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span style={{color: order.employees ? '#27ae60' : '#ccc', fontWeight: 500}}>
                                                {employeeName}
                                            </span>
                                        )}
                                    </td>

                                    <td className={css.tdType}>{productLabel}</td>

                                    <td className={css.td}>
                                        {order.total_price > 0 ? `${order.total_price} грн` : '—'}
                                    </td>

                                    <td className={css.td}>
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className={css.arrow}>{isOpen ? '▼' : '▶'}</td>
                                </tr>

                                {/* --- ДЕТАЛІ (РЕДАГУВАННЯ) --- */}
                                {isOpen && (
                                    <tr className={css.rowDetails}>
                                        <td colSpan="8" style={{ padding: '0' }}>
                                            <div className={css.detailsWrapper}>
                                                
                                                {/* ЛІВА КОЛОНКА: Технічні характеристики */}
                                                <div>
                                                    <h4 className={css.detailsTitle}>Технічні дані</h4>
                                                    <ul className={css.detailsList}>
                                                        <li><span className={css.label}>Метал:</span> {item?.metal?.label || '—'}</li>
                                                        
                                                        {/* Розмір */}
                                                        <li>
                                                            <span className={css.label}>Розмір:</span> 
                                                            {isEditing ? (
                                                                <input type="text" name="size" className={css.inputField} value={formData.size} onChange={handleInputChange} />
                                                            ) : (item?.size || '—')}
                                                        </li>
                                                        {/* Вага */}
                                                        <li>
                                                            <span className={css.label}>Вага (г):</span> 
                                                            {isEditing ? (
                                                                <input type="number" name="weight_g" className={css.inputField} value={formData.weight_g} onChange={handleInputChange} />
                                                            ) : (item?.weight_g || '—')}
                                                        </li>
                                                        
                                                        {/* КАМЕНІ */}
                                                        <li>
                                                            <span className={css.label}>Вставка:</span>
                                                            <div style={{marginTop: '5px'}}>
                                                                {item?.stones && item.stones.length > 0 ? (
                                                                    item.stones.map((st, i) => {
                                                                        
                                                                        // --- ЛОГІКА ВІДОБРАЖЕННЯ НАЗВИ ---
                                                                        let displayText = '';

                                                                        if (st.catalog_stone) {
                                                                            // 1. Пріоритет: Якщо це камінь з каталогу
                                                                            displayText = `${st.catalog_stone.name} (${st.catalog_stone.shape})`;
                                                                        } 
                                                                        else if (st.description) {
                                                                            // 2. Пріоритет: Якщо це діамант під замовлення (беремо опис з бази)
                                                                            displayText = st.description;
                                                                        } 
                                                                        else {
                                                                            // 3. Якщо пусто і там, і там (помилка даних)
                                                                            displayText = 'Невідомий камінь';
                                                                        }
                                                                        // ----------------------------------

                                                                        return (
                                                                            <div key={i} className={css.serviceTag} style={{marginBottom: '5px'}}>
                                                                                {displayText} - {st.quantity} шт.
                                                                                
                                                                                {isEditing && (
                                                                                    <span 
                                                                                        className={css.deleteCross} 
                                                                                        onClick={() => handleDeleteStone(order.id, st.id)} 
                                                                                        style={{marginLeft: '8px'}}
                                                                                    >
                                                                                        ×
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })
                                                                ) : (
                                                                    <span style={{color: '#999', fontStyle: 'italic'}}>Без каменю</span>
                                                                )}
                                                            </div>

                                                            {/* Кнопка додавання каменю */}
                                                            {isEditing && (
                                                                <button 
                                                                    className={css.btnAddSmall} 
                                                                    style={{marginTop: '5px'}}
                                                                    onClick={() => openStoneModal(order.id, item.id)}
                                                                >
                                                                    + Додати камінь
                                                                </button>
                                                            )}
                                                        </li>
                                                    </ul>
                                                </div>

                                                {/* ПРАВА КОЛОНКА: Орг. питання та Керування */}
                                                <div>
                                                    <h4 className={css.detailsTitle}>Організація та Статус</h4>
                                                    <ul className={css.detailsList}>
                                                        <li>
                                                            <span className={css.label}>Бюджет:</span>
                                                            {isEditing ? (
                                                                <input type="number" name="total_price" className={css.inputField} value={formData.total_price} onChange={handleInputChange} />
                                                            ) : (`${order.total_price} грн`)}
                                                        </li>
                                                        <li>
                                                            <span className={css.label}>Дедлайн:</span>
                                                            {isEditing ? (
                                                                <input type="date" name="deadline" className={css.inputField} value={formData.deadline} onChange={handleInputChange} />
                                                            ) : (order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Не вказано')}
                                                        </li>
                                                        
                                                        {/* ПОСЛУГИ */}
                                                        <li>
                                                            <span className={css.label}>Послуги:</span>
                                                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '5px 0'}}>
                                                                {item?.services?.map((srv, i) => (
                                                                    <span key={i} className={css.serviceTag}>
                                                                        {srv.service_dict?.label} ({srv.price})
                                                                        {isEditing && (
                                                                            <span className={css.deleteCross} onClick={() => handleDeleteService(order.id, srv.id)}>×</span>
                                                                        )}
                                                                    </span>
                                                                )) || '—'}
                                                            </div>

                                                            {isEditing && (
                                                                <div style={{display: 'flex', gap: '5px'}}>
                                                                    <select className={css.selectField} value={newServiceId} onChange={(e) => setNewServiceId(e.target.value)}>
                                                                        <option value="">+ Додати послугу</option>
                                                                        {availableServices.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                                    </select>
                                                                    <button className={css.btnAddSmall} onClick={() => handleAddService(order.id, item.id)} disabled={!newServiceId}>OK</button>
                                                                </div>
                                                            )}
                                                        </li>
                                                    </ul>

                                                    {/* БЛОК РЕДАГУВАННЯ СТАТУСУ */}
                                                    <div className={css.editBlock}>
                                                        <div style={{marginBottom: '10px'}}>
                                                            <span className={css.label}>Статус:</span>
                                                            {isEditing ? (
                                                                <select name="status" className={css.selectField} value={formData.status} onChange={handleInputChange}>
                                                                    {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                                </select>
                                                            ) : (<strong>{order.status}</strong>)}
                                                        </div>

                                                        <div>
                                                            <span className={css.label}>Коментар:</span>
                                                            {isEditing ? (
                                                                <textarea name="order_comment" className={css.textareaField} value={formData.order_comment} onChange={handleInputChange} />
                                                            ) : (
                                                                <p style={{fontSize: '0.9em', color: '#555', marginTop: '5px'}}>{order.order_comment || '—'}</p>
                                                            )}
                                                        </div>

                                                        {/* КНОПКИ ДІЙ */}
                                                        <div className={css.actionButtons}>
                                                            {isEditing ? (
                                                                <>
                                                                    <button className={`${css.btnBase} ${css.btnSave}`} onClick={() => handleSave(order.id, item?.id)}>
                                                                        Зберегти
                                                                    </button>
                                                                    <button className={`${css.btnBase} ${css.btnCancel}`} onClick={cancelEditing}>
                                                                        Скасувати
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button className={`${css.btnBase} ${css.btnEdit}`} onClick={() => startEditing(order, item)}>
                                                                    Редагувати
                                                                </button>
                                                            )}
                                                        </div>
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

            {/* 👇 МОДАЛКА */}
            <AddStoneModal 
                isOpen={isStoneModalOpen}
                onClose={() => setIsStoneModalOpen(false)}
                onAdd={handleAddStone}
            />
        </div>
    );
};

// Бейдж статусу
const StatusBadge = ({ status }) => {
    const statusMap = {
        new: 'Нове', modeling: '3D Модель', casting: 'Лиття', 
        setting: 'Закріпка', done: 'Готово', issued: 'Видано'
    };
    const className = `${css.badge} ${css[`status_${status}`] || css.status_default}`;
    return <span className={className}>{statusMap[status] || status}</span>;
};

export default AllOrders;