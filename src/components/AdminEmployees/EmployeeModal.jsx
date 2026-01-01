import { useState } from 'react';
import css from './AdminEmployees.module.css'; 

const ROLES = [
    { value: 'jeweler', label: 'Ювелір' },
    { value: 'setter', label: 'Закріплювач' },
    { value: 'designer', label: '3D Дизайнер' },
    { value: 'manager', label: 'Менеджер' },
    { value: 'admin', label: 'Адмін' }
];

const initialState = {
    full_name: '',
    phone: '',
    email: '',
    role: 'jeweler',
    password_hash: '', 
    is_active: true
};


const EmployeeModal = ({ isOpen, onClose, onSave, employeeToEdit }) => {
    const [formData, setFormData] = useState(() => {
            if (employeeToEdit) {
                return {
                    full_name: employeeToEdit.full_name,
                    phone: employeeToEdit.phone,
                    email: employeeToEdit.email || '',
                    role: employeeToEdit.role,
                    password_hash: '', 
                    is_active: employeeToEdit.is_active
                };
            }
            return initialState;
    });
    
    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSend = { ...formData };

        if (employeeToEdit && !dataToSend.password_hash) {
            delete dataToSend.password_hash;
        }

        onSave(dataToSend);
    };

    if (!isOpen) return null;

    return (
        <div className={css.overlay} onClick={onClose}>
            <div className={css.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={css.modalTitle}>
                    {employeeToEdit ? 'Редагувати співробітника' : 'Новий співробітник'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                    {/* ПІБ */}
                    <div className={css.formGroup}>
                        <label className={css.label}>ПІБ:</label>
                        <input 
                            name="full_name" 
                            className={css.input} 
                            value={formData.full_name} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className={css.formGroup}>
                        <label className={css.label}>Телефон:</label>
                        <input 
                            name="phone" 
                            className={css.input} 
                            value={formData.phone} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className={css.formGroup}>
                        <label className={css.label}>Email (Логін):</label>
                        <input 
                            name="email" 
                            className={css.input} 
                            value={formData.email} 
                            onChange={handleChange} 
                        />
                    </div>

                    <div className={css.formGroup}>
                        <label className={css.label}>Роль:</label>
                        <select name="role" className={css.select} value={formData.role} onChange={handleChange}>
                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>

                    <div className={css.formGroup}>
                        <label className={css.label}>
                            {employeeToEdit ? 'Новий пароль (не обов\'язково):' : 'Пароль:'}
                        </label>
                        <input 
                            type="password" 
                            name="password_hash" 
                            className={css.input} 
                            value={formData.password_hash} 
                            onChange={handleChange}
                            required={!employeeToEdit} 
                            placeholder={employeeToEdit ? "Залиште пустим, щоб не міняти" : ""}
                        />
                    </div>

                    <div className={css.formGroup} style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <input 
                            type="checkbox" 
                            name="is_active" 
                            id="isActive" 
                            checked={formData.is_active} 
                            onChange={handleChange} 
                            style={{width: 'auto'}}
                        />
                        <label htmlFor="isActive" style={{margin: 0, cursor: 'pointer'}}>
                            Активний співробітник
                        </label>
                    </div>

                    <div className={css.modalActions}>
                        <button type="button" className={css.btnCancel} onClick={onClose}>
                            Скасувати
                        </button>
                        <button type="submit" className={css.btnSave}>
                            Зберегти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;