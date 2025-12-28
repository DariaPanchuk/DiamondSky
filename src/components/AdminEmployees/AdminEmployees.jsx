import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, addEmployee, updateEmployee } from '../../redux/employees/operations';
import { selectEmployeesList, selectEmployeesLoading } from '../../redux/employees/selectors';
import EmployeeModal from './EmployeeModal';
import css from './AdminEmployees.module.css';

// Словник для гарного відображення ролей
const ROLE_LABELS = {
    jeweler: 'Ювелір',
    setter: 'Закріплювач',
    designer: '3D Дизайнер',
    manager: 'Менеджер',
    admin: 'Адміністратор'
};

const AdminEmployees = () => {
    const dispatch = useDispatch();
    const employees = useSelector(selectEmployeesList);
    const isLoading = useSelector(selectEmployeesLoading);
    
    // Стан для модального вікна
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Стан для редагування (якщо null - це створення, якщо об'єкт - редагування)
    const [editingEmployee, setEditingEmployee] = useState(null);

    // Завантажуємо список при відкритті сторінки
    useEffect(() => {
        dispatch(fetchEmployees());
    }, [dispatch]);

    // --- ОБРОБНИКИ ПОДІЙ ---

    const handleAddClick = () => {
        setEditingEmployee(null); // Очищаємо, бо це новий запис
        setIsModalOpen(true);
    };

    const handleEditClick = (employee) => {
        setEditingEmployee(employee); // Записуємо, кого редагуємо
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (editingEmployee) {
                // ОНОВЛЕННЯ
                await dispatch(updateEmployee({ 
                    id: editingEmployee.id, 
                    updates: formData 
                })).unwrap();
            } else {
                // СТВОРЕННЯ
                await dispatch(addEmployee(formData)).unwrap();
            }
            // Закриваємо модалку тільки якщо немає помилок
            setIsModalOpen(false);
        } catch (error) {
            alert(`Помилка: ${error}`);
        }
    };

    const toggleStatus = (employee) => {
        const action = employee.is_active ? 'деактивувати' : 'активувати';
        if (window.confirm(`Ви впевнені, що хочете ${action} співробітника ${employee.full_name}?`)) {
            dispatch(updateEmployee({ 
                id: employee.id, 
                updates: { is_active: !employee.is_active } 
            }));
        }
    };

    // --- РЕНДЕР ---

    if (isLoading && employees.length === 0) {
        return <div className={css.loading}>Завантаження списку...</div>;
    }

    return (
        <div className={css.container}>
            {/* ШАПКА */}
            <div className={css.header}>
                <button className={css.addBtn} onClick={handleAddClick}>
                    + Додати працівника
                </button>
            </div>

            {/* ТАБЛИЦЯ */}
            {employees.length === 0 ? (
                <div style={{padding: '20px', textAlign: 'center', color: '#777'}}>
                    Список співробітників порожній. Додайте першого!
                </div>
            ) : (
                <table className={css.table}>
                    <thead>
                        <tr>
                            <th className={css.th}>ПІБ</th>
                            <th className={css.th}>Контакти</th>
                            <th className={css.th}>Роль</th>
                            <th className={css.th}>Статус</th>
                            <th className={css.th} style={{textAlign: 'right'}}>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} style={{opacity: emp.is_active ? 1 : 0.6}}>
                                <td className={css.td}>
                                    <strong>{emp.full_name}</strong>
                                </td>
                                <td className={css.td}>
                                    <div>{emp.phone}</div>
                                    {emp.email && <div style={{fontSize: '0.85em', color: '#888'}}>{emp.email}</div>}
                                </td>
                                <td className={css.td}>
                                    <span className={`${css.roleBadge} ${css[`role_${emp.role}`]}`}>
                                        {ROLE_LABELS[emp.role] || emp.role}
                                    </span>
                                </td>
                                <td className={css.td}>
                                    {emp.is_active ? 
                                        <span className={css.statusActive}>Активний</span> : 
                                        <span className={css.statusInactive}>Неактивний</span>
                                    }
                                </td>
                                <td className={css.td} style={{textAlign: 'right'}}>
                                    <button 
                                        className={css.actionBtn} 
                                        onClick={() => handleEditClick(emp)}
                                        title="Редагувати"
                                    >
                                        Редагувати
                                    </button>
                                    <button 
                                        className={css.actionBtn} 
                                        onClick={() => toggleStatus(emp)} 
                                        title={emp.is_active ? "Звільнити/В архів" : "Відновити"}
                                        style={{color: emp.is_active ? '#e74c3c' : '#27ae60'}}
                                    >
                                        {emp.is_active ? 'Видалити' : '✅'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* МОДАЛЬНЕ ВІКНО */}
            <EmployeeModal 
                key={editingEmployee ? editingEmployee.id : 'new'}
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave}
                employeeToEdit={editingEmployee}
            />
        </div>
    );
};

export default AdminEmployees;