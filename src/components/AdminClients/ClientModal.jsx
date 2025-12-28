import { useState } from 'react';
import css from './AdminClients.module.css';

const initialState = {
    full_name: '',
    phone: '',
    birthday: '',
    discount_percent: 0,
    total_spent: '',
    email: '',
};

const ClientModal = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const [formData, setFormData] = useState(() => {
        if (clientToEdit) {
            return {
                full_name: clientToEdit.full_name || '',
                phone: clientToEdit.phone || '',
                birthday: clientToEdit.birthday || '',
                discount_percent: clientToEdit.personal_discount_percent || 0,
                total_spent: clientToEdit.total_spent || '',
                email: clientToEdit.email || '',
            };
        }
        return initialState;
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className={css.overlay} onClick={onClose}>
            <div className={css.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={css.modalTitle}>
                    {clientToEdit ? 'Редагувати клієнта' : 'Новий клієнт'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                    <div className={css.formGroup}>
                        <label className={css.label}>ПІБ:</label>
                        <input name="full_name" className={css.input} value={formData.full_name} onChange={handleChange} required />
                    </div>

                    <div className={css.formGroup}>
                        <label className={css.label}>Телефон:</label>
                        <input name="phone" className={css.input} value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className={css.formGroup}>
                        <label className={css.label}>День народження:</label>
                        <input 
                            type="date" 
                            name="birthday" 
                            className={css.input} 
                            value={formData.birthday} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className={css.formGroup}>
                        <label className={css.label}>Знижка (%):</label>
                        <input 
                            type="number" 
                            name="discount_percent" 
                            className={css.input} 
                            value={formData.discount_percent} 
                            onChange={handleChange} 
                            min="0" max="100"
                        />
                    </div>
                    <div className={css.formGroup}>
                        <label className={css.label}>Всього витрачено:</label>
                        <input 
                            type="number" 
                            name="discount_percent" 
                            className={css.input} 
                            value={formData.total_spent} 
                            onChange={handleChange} 
                            min="0" max="100000000000"
                        />
                    </div>
                    <div className={css.formGroup}>
                        <label className={css.label}>Email:</label>
                        <input name="email" className={css.input} value={formData.email} onChange={handleChange} />
                    </div>
                    <div className={css.modalActions}>
                        <button type="button" className={css.btnCancel} onClick={onClose}>Скасувати</button>
                        <button type="submit" className={css.btnSave}>Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;