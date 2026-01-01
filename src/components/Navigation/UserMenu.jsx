import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logOut } from '../../redux/auth/operations';
import { selectUser, selectUserRole } from '../../redux/auth/selectors';
import css from './UserMenu.module.css';

const UserMenu = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);

  const dashboardPath = role === 'client' ? '/client' : '/employee';
  const roleLabel = role === 'client' ? 'Клієнт' : 'Співробітник';

  return (
    <div className={css.wrapper}>
      <div className={css.userInfo}>
        <div className={css.userName}>
          {user.user_metadata?.full_name || user.email}
        </div>
        <div className={css.userRole}>
          {roleLabel}
        </div>
      </div>

      <Link to={dashboardPath} className={css.btnPrimary}>
        Особистий кабінет
      </Link>
      
      <button 
        onClick={() => dispatch(logOut())} 
        className={css.btnLogout}
        title="Вийти"
      >
        Вихід
      </button>
    </div>
  );
};

export default UserMenu;