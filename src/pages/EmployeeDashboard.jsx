import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../redux/auth/selectors';
import JewelerOrders from '../components/JewelerOrders/JewelerOrders'; 
import AllOrders from '../components/AllOrders/AllOrders';
import AdminEmployees from '../components/AdminEmployees/AdminEmployees';
import AdminClients from '../components/AdminClients/AdminClients';
import Warehouse from '../components/Warehouse/Warehouse';
import css from './EmployeeDashboard.module.css';



const EmployeeDashboard = () => {
    const role = useSelector(selectUserRole); 

    // Стан активної вкладки (за замовчуванням 'orders')
    const [activeTab, setActiveTab] = useState('orders');

    // Хелпер для визначення прав доступу
    const isAdmin = role === 'admin';
    const isManager = role === 'admin' || role === 'manager';
    const isJeweler = role === 'jeweler';

    return (
        <div className={css.container}>

            {/* 2. ТАБИ (КНОПКИ) */}
            <div className={css.tabs}>
                
                {/* Вкладка ЗАМОВЛЕННЯ (Є у всіх, але різна) */}
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`${css.tabBtn} ${activeTab === 'orders' ? css.activeTab : ''}`}
                >
                    {isJeweler ? 'Мої завдання' : 'Всі замовлення'}
                </button>

                {/* Вкладки для АДМІНА та МЕНЕДЖЕРА */}
                {isManager && (
                    <>
                        <button 
                            onClick={() => setActiveTab('clients')}
                            className={`${css.tabBtn} ${activeTab === 'clients' ? css.activeTab : ''}`}
                        >
                            Клієнти
                        </button>
                        <button 
                            onClick={() => setActiveTab('warehouse')}
                            className={`${css.tabBtn} ${activeTab === 'warehouse' ? css.activeTab : ''}`}
                        >
                            Склад
                        </button>
                    </>
                )}

                {/* Вкладка тільки для АДМІНА */}
                {isAdmin && (
                    <button 
                        onClick={() => setActiveTab('employees')}
                        className={`${css.tabBtn} ${activeTab === 'employees' ? css.activeTab : ''}`}
                    >
                        Співробітники
                    </button>
                )}
            </div>

            {/* 3. ОБЛАСТЬ КОНТЕНТУ */}
            <div className={css.contentArea}>
                
                {/* Логіка відображення: ЗАМОВЛЕННЯ */}
                {activeTab === 'orders' && (
                    isJeweler 
                        ? <div style={{padding: 20}}><JewelerOrders /></div> 
                        : <div style={{padding: 20}}><AllOrders/></div>
                )}

                {/* Логіка відображення: ІНШІ ВКЛАДКИ */}
                {activeTab === 'clients' && (
                    <div style={{padding: 20}}><AdminClients/></div>
                )}

                {activeTab === 'warehouse' && (
                    <div style={{padding: 20}}><Warehouse/></div>
                )}

                {activeTab === 'employees' && (
                    <div style={{padding: 20}}><AdminEmployees /></div>
                )}

            </div>
        </div>
    );
};

export default EmployeeDashboard;