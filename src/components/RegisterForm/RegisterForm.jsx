import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../redux/auth/operations';
import { selectAuthError, selectIsLoggedIn } from '../../redux/auth/selectors';
import css from './RegisterForm.module.css';

const RegisterForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const error = useSelector(selectAuthError);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/client');
        }
    }, [isLoggedIn, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register(formData));
    };

    return (
        <div className={css.container}>
            <h2 className={css.title}>Реєстрація клієнта</h2>
            
            {error && <div className={css.error}>Помилка: {error}</div>}

            <form onSubmit={handleSubmit} className={css.form}>
                <input
                    type="text"
                    name="full_name"
                    placeholder="ПІБ (Повне ім'я)"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className={css.input}
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Телефон (+380...)"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={css.input}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={css.input}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Пароль (мін. 6 символів)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={css.input}
                />
                
                <button type="submit" className={css.button}>
                    Зареєструватися
                </button>
            </form>
            
            <div className={css.footerText}>
                Вже є акаунт? 
                <Link to="/login" className={css.link}>
                    Увійти
                </Link>
            </div>
        </div>
    );
};

export default RegisterForm;