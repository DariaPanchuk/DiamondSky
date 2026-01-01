import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../redux/orders/operations';
import { selectOrders, selectOrdersLoading } from '../../redux/orders/selectors';
import css from './ClientOrders.module.css'; 

const ClientOrders = () => {
    const dispatch = useDispatch();
    const orders = useSelector(selectOrders);
    const loading = useSelector(selectOrdersLoading);

    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const toggleOrder = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    if (loading) return <div style={{textAlign: 'center', padding: '20px'}}>Завантаження...</div>;

    if (!orders || orders.length === 0) {
        return (
            <div className={css.emptyState}>
                <h3>У вас поки немає активних замовлень 📭</h3>
            </div>
        );
    }

    return (
        <div className={css.container}>
            <table className={css.table}>
                <thead>
                    <tr className={css.tableHeader}>
                        <th className={css.th}>№</th>
                        <th className={css.th}>Дата</th>
                        <th className={css.th}>Тип виробу</th>
                        <th className={css.th}>Вартість</th>
                        <th className={css.th}>Статус</th>
                        <th className={css.th}></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => {
                        const item = order.items && order.items[0]; 
                        const isOpen = expandedOrderId === order.id;
                        const productLabel = item?.product_type?.label || 'Виріб';

                        return (
                            <>
                                <tr 
                                    key={order.id} 
                                    onClick={() => toggleOrder(order.id)}
                                    className={isOpen ? css.rowMainActive : css.rowMain}
                                >
                                    <td className={css.tdIndex}>{index + 1}</td>
                                    <td className={css.td}>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className={css.tdType}>{productLabel}</td>
                                    
                                    <td className={css.td}>
                                        {order.total_price > 0 
                                            ? `${order.total_price.toLocaleString()} грн` 
                                            : <span className={css.priceUnknown}>На розрахунку</span>
                                        }
                                    </td>
                                    
                                    <td className={css.td}>
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className={css.arrow}>{isOpen ? '▼' : '▶'}</td>
                                </tr>

                                {isOpen && (
                                    <tr className={css.rowDetails}>
                                        <td colSpan="6" style={{ padding: '0' }}>
                                            <div className={css.detailsWrapper}>
                                                
                                                <div>
                                                    <h4 className={css.detailsTitle}>Характеристики</h4>
                                                    <ul className={css.detailsList}>
                                                        <li>
                                                            <span className={css.label}>Тип:</span> 
                                                            <strong>{productLabel}</strong>
                                                        </li>
                                                        <li>
                                                            <span className={css.label}>Метал:</span> 
                                                            {item?.metal?.label || 'Не вказано'}
                                                        </li>
                                                        <li>
                                                            <span className={css.label}>Розмір:</span> 
                                                            {item?.size ? item.size : '—'}
                                                        </li>
                                                        <li>
                                                            <span className={css.label}>Вага:</span> 
                                                            {item?.weight_g ? `${item.weight_g} г` : '—'}
                                                        </li>
                                                        
                                                        <li>
                                                            <span className={css.label}>Вставка:</span>
                                                            {item?.stones && item.stones.length > 0 ? (
                                                                <span className={css.stoneInfo}>
                                                                    {item.stones[0].catalog_stone?.name} 
                                                                    {' '}({item.stones[0].catalog_stone?.shape})
                                                                    {' '}- {item.stones[0].quantity} шт.
                                                                </span>
                                                            ) : (
                                                                <span>Індивідуальний підбір / Без каменю</span>
                                                            )}
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className={css.detailsTitle}>Деталі</h4>
                                                    
                                                    {item?.services && item.services.length > 0 && (
                                                        <div className={css.servicesContainer}>
                                                            <span className={css.label}>Послуги:</span>
                                                            <div className={css.servicesList}>
                                                                {item.services.map((srv, i) => (
                                                                    <span key={i} className={css.serviceTag}>
                                                                        {srv.service_dict?.label}
                                                                        {' '}({srv.price} грн)
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div style={{ marginBottom: '10px' }}>
                                                        <span className={css.label}>Дедлайн:</span> 
                                                        {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Не вказано'}
                                                    </div>

                                                    <div>
                                                        <span className={css.label}>Коментар:</span>
                                                        <p className={css.commentBox}>
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

const StatusBadge = ({ status }) => {
    const statusMap = {
        new: 'Нове',
        modeling: '3D Моделювання',
        casting: 'Лиття',
        setting: 'Закріпка',
        done: 'Готово',
        issued: 'Видано'
    };

    const className = `${css.badge} ${css[`status_${status}`] || css.status_default}`;
    const label = statusMap[status] || status;

    return <span className={className}>{label}</span>;
};

export default ClientOrders;