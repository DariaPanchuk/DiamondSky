import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../../redux/auth/selectors';
import AuthNav from './AuthNav';
import UserMenu from './UserMenu';
import css from './Navigation.module.css';

const Navigation = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  return (
    <header className={css.header}>
      <Link to="/" className={css.logo}>
        DiamondSky
      </Link>
      <nav className={css.nav}>
        <Link to="/" className={css.link}>Головна</Link>
        <Link to="/about" className={css.link}>Про нас</Link>
        <Link to="/portfolio" className={css.link}>Портфоліо</Link>
      </nav>
      <div>
        {isLoggedIn ? <UserMenu /> : <AuthNav />}
      </div>
    </header>
  );
};

export default Navigation;