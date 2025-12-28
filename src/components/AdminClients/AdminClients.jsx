import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClients, addClient, updateClient, deleteClient } from '../../redux/clients/operations';
import { selectClientsList, selectClientsLoading } from '../../redux/clients/selectors';
import ClientModal from './ClientModal';
import css from './AdminClients.module.css'; // Ті самі стилі

const AdminClients = () => {
    const dispatch = useDispatch();
    const clients = useSelector(selectClientsList);
    const isLoading = useSelector(selectClientsLoading);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    const handleAddClick = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (client) => {
        const isConfirmed = window.confirm(
            `Ви дійсно хочете видалити клієнта ${client.full_name}?\nЦю дію неможливо відмінити.`
        );

        if (isConfirmed) {
            try {
                await dispatch(deleteClient(client.id)).unwrap();
                alert('Клієнта успішно видалено');
            } catch (error) {
                console.error(error);
                alert(`Не вдалося видалити: можливо, у цього клієнта є активні замовлення.`);
            }
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingClient) {
                await dispatch(updateClient({ 
                    id: editingClient.id, 
                    updates: formData 
                })).unwrap();
            } else {
                await dispatch(addClient(formData)).unwrap();
            }
            setIsModalOpen(false);
        } catch (error) {
            alert(`Помилка: ${error}`);
        }
    };

    if (isLoading && clients.length === 0) {
        return <div className={css.loading}>Завантаження бази клієнтів...</div>;
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <button className={css.addBtn} onClick={handleAddClick}>
                    + Додати клієнта
                </button>
            </div>

            {clients.length === 0 ? (
                <div style={{padding: '20px', textAlign: 'center', color: '#777'}}>
                    Список клієнтів порожній.
                </div>
            ) : (
                <table className={css.table}>
                    <thead>
                        <tr>
                            <th className={css.th}>Клієнт</th>
                            <th className={css.th}>Контакти</th>
                            <th className={css.th}>День народження</th>
                            <th className={css.th}>Знижка</th>
                            <th className={css.th} style={{textAlign: 'right'}}>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id}>
                                <td className={css.td}>
                                    <strong>{client.full_name}</strong>
                                </td>
                                <td className={css.td}>
                                    <div>{client.phone}</div>
                                    {client.email && <div style={{fontSize: '0.85em', color: '#888'}}>{client.email}</div>}
                                </td>
                                <td className={css.td}>
                                    <strong>{client.birthday}</strong>
                                </td>
                                <td className={css.td}>
                                    {client.personal_discount_percent > 0 ? (
                                        <span style={{color: '#e67e22', fontWeight: 'bold'}}>
                                            {client.personal_discount_percent}%
                                        </span>
                                    ) : '—'}
                                </td>
                                <td className={css.td} style={{textAlign: 'right'}}>
                                    <button 
                                        className={css.actionBtn} 
                                        onClick={() => handleEditClick(client)}
                                        title="Редагувати"
                                    >
                                        Редагувати
                                    </button>
                                    <button 
                                        className={css.actionBtn} 
                                        onClick={() => handleDeleteClick(client)} 
                                        title="Видалити"
                                        style={{color: '#e74c3c'}}
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <ClientModal 
                key={editingClient ? editingClient.id : 'new'}
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave}
                clientToEdit={editingClient}
            />
        </div>
    );
};

export default AdminClients;