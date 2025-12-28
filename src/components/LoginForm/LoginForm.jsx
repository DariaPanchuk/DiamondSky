import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

// Імпорти Redux
import { logIn } from '../../redux/auth/operations';
import { selectAuthError, selectIsLoggedIn, selectUserRole } from '../../redux/auth/selectors';

// Імпорт стилів
import css from './LoginForm.module.css';

const LoginForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Локальний стейт
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Дані з Redux
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const role = useSelector(selectUserRole);
    const error = useSelector(selectAuthError);

    // Логіка перенаправлення після успішного входу
    useEffect(() => {
        if (isLoggedIn && role) {
            if (role === 'client') {
                navigate('/client');
            } else {
                navigate('/employee');
            }
        }
    }, [isLoggedIn, role, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(logIn({ email, password }));
    };

    return (
        <div className={css.container}>
            <h2 className={css.title}>Вхід у систему</h2>

            {error && <div className={css.error}>Помилка: {error}</div>}

            <form onSubmit={handleSubmit} className={css.form}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={css.input}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={css.input}
                />
                
                <button type="submit" className={css.button}>
                    Увійти
                </button>
            </form>

            <div className={css.footerText}>
                Немає акаунту? 
                <Link to="/register" className={css.link}>
                    Зареєструватися
                </Link>
            </div>
        </div>
    );
};

export default LoginForm;