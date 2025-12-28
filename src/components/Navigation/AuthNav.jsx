import { Link } from 'react-router-dom';
import css from './AuthNav.module.css';

const AuthNav = () => {
    return (
        <div className={css.wrapper}>
        <Link to="/login" className={css.link}>
            Увійти
        </Link>
        <Link to="/register" className={css.btnRegister}>
            Реєстрація
        </Link>
        </div>
    );
};

export default AuthNav;