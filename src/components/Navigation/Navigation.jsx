import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../../redux/auth/selectors';

import AuthNav from './AuthNav';
import UserMenu from './UserMenu';

// 👇 Імпорт стилів
import css from './Navigation.module.css';

const Navigation = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return (
    <header className={css.header}>
      {/* 1. Логотип */}
      <Link to="/" className={css.logo}>
        DiamondSky
      </Link>

      {/* 2. Загальне меню */}
      <nav className={css.nav}>
        <Link to="/" className={css.link}>Головна</Link>
        <Link to="/about" className={css.link}>Про нас</Link>
        <Link to="/portfolio" className={css.link}>Портфоліо</Link>
      </nav>

      {/* 3. Права частина */}
      <div>
        {isLoggedIn ? <UserMenu /> : <AuthNav />}
      </div>
    </header>
  );
};

export default Navigation;