import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../config/supabaseClient';
import { updateUserProfile } from '../redux/auth/operations';

// Імпортуємо підкомпоненти (ми їх створимо нижче)
import ClientOrders from '../components/ClientOrders/ClientOrders';
import CreateOrderForm from '../components/CreateOrderForm/CreateOrderForm';

const ClientDashboard = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    
    // Стан інтерфейсу
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' або 'create'
    const [isEditing, setIsEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Стан даних профілю
    const [profile, setProfile] = useState({ full_name: '', phone: '', email: '' });
    
    // Стан форми редагування (з паролем)
    const [editForm, setEditForm] = useState({ full_name: '', phone: '', password: '' });

    // 1. Завантаження профілю
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const { data } = await supabase
                    .from('clients')
                    .select('full_name, phone, email')
                    .eq('id', user.id)
                    .single();
                
                if (data) {
                    setProfile(data);
                    setEditForm(prev => ({ ...prev, full_name: data.full_name, phone: data.phone }));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [user]);

    // 2. Збереження з перевіркою пароля
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        if (!editForm.password) {
            alert("Будь ласка, введіть пароль для підтвердження змін.");
            return;
        }

        try {
            // А. Перевіряємо пароль через спробу входу
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email, // Email беремо з Redux/State, він не змінюється тут
                password: editForm.password
            });

            if (authError) {
                alert("Невірний пароль! Зміни не збережено.");
                return;
            }

            // Б. Якщо пароль ок -> оновлюємо дані
            const result = await dispatch(updateUserProfile({
                full_name: editForm.full_name,
                phone: editForm.phone
            }));

            if (updateUserProfile.fulfilled.match(result)) {
                setProfile(prev => ({ ...prev, full_name: editForm.full_name, phone: editForm.phone }));
                setIsEditing(false);
                setEditForm(prev => ({ ...prev, password: '' })); // Очищаємо пароль
                alert("Дані успішно оновлено! ✅");
            }
        } catch (error) {
            alert("Помилка: " + error.message);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditForm({ ...editForm, full_name: profile.full_name, phone: profile.phone, password: '' });
    };

    if (loadingProfile) return <div style={{padding:'20px'}}>Завантаження профілю...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
            
            {/* === БЛОК ПРОФІЛЮ === */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    
                    {/* Інформація */}
                    {!isEditing ? (
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2 style={{ margin: 0, color: '#2c3e50' }}>👤 Мій Профіль</h2>
                                <button onClick={() => setIsEditing(true)} style={btnOutline}>
                                    Редагувати профіль
                                </button>
                            </div>
                            
                            <div style={infoGrid}>
                                <div>
                                    <span style={labelStyle}>ПІБ:</span>
                                    <div style={valueStyle}>{profile.full_name || 'Не вказано'}</div>
                                </div>
                                <div>
                                    <span style={labelStyle}>Email:</span>
                                    <div style={valueStyle}>{user.email}</div>
                                </div>
                                <div>
                                    <span style={labelStyle}>Телефон:</span>
                                    <div style={valueStyle}>{profile.phone || 'Не вказано'}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Форма редагування
                        <form onSubmit={handleSaveProfile} style={{ width: '100%' }}>
                            <h3 style={{ marginTop: 0 }}>Редагування даних</h3>
                            <div style={{ display: 'grid', gap: '15px', maxWidth: '400px' }}>
                                <label>
                                    Ім'я:
                                    <input 
                                        type="text" 
                                        value={editForm.full_name} 
                                        onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                                        style={inputStyle}
                                    />
                                </label>
                                <label>
                                    Телефон:
                                    <input 
                                        type="text" 
                                        value={editForm.phone} 
                                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                        style={inputStyle}
                                    />
                                </label>
                                
                                <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', border: '1px solid #ffeeba' }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '0.9em' }}>
                                        🔒 Підтвердіть паролем для збереження:
                                        <input 
                                            type="password" 
                                            value={editForm.password} 
                                            onChange={e => setEditForm({...editForm, password: e.target.value})}
                                            style={{...inputStyle, marginTop: '5px'}}
                                            placeholder="Ваш пароль"
                                            required
                                        />
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" style={btnPrimary}>Зберегти зміни</button>
                                    <button type="button" onClick={cancelEdit} style={btnSecondary}>Скасувати</button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* === НАВІГАЦІЯ ВКЛАДОК === */}
            <div style={{ display: 'flex', gap: '15px', margin: '30px 0 20px 0' }}>
                <button 
                    onClick={() => setActiveTab('orders')}
                    style={activeTab === 'orders' ? activeTabStyle : tabStyle}
                >
                    Мої замовлення
                </button>
                <button 
                    onClick={() => setActiveTab('create')}
                    style={activeTab === 'create' ? activeTabStyle : tabStyle}
                >
                    Замовити
                </button>
            </div>

            {/* === КОНТЕНТ (Conditional Rendering) === */}
            <div style={{ minHeight: '400px' }}>
                {activeTab === 'orders' && <ClientOrders />}
                {activeTab === 'create' && (
                    <CreateOrderForm onSuccess={() => setActiveTab('orders')} />
                )}
            </div>

        </div>
    );
};

// --- СТИЛІ ---
const cardStyle = { background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' };
const labelStyle = { color: '#7f8c8d', fontSize: '0.85em', display: 'block', marginBottom: '4px' };
const valueStyle = { fontWeight: 'bold', fontSize: '1.1em', color: '#2c3e50' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };

const btnPrimary = { background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' };
const btnSecondary = { background: '#95a5a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' };
const btnOutline = { background: 'transparent', color: '#3498db', border: '1px solid #3498db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };

const tabStyle = { padding: '12px 24px', background: '#ecf0f1', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em', color: '#7f8c8d', fontWeight: 'bold' };
const activeTabStyle = { ...tabStyle, background: '#2c3e50', color: 'white' };

export default ClientDashboard;