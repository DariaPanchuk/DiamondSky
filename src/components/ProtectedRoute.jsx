import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
    selectIsLoggedIn, 
    selectUserRole, 
    selectIsRefreshing 
} from '../redux/auth/selectors';

/**
 * Компонент-обгортка для захисту приватних маршрутів.
 * @param {Array} allowedRoles - Масив дозволених ролей (напр. ['admin', 'manager'])
 * @param {React.ReactNode} children - Дочірні компоненти (сторінка, яку треба показати)
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
    const location = useLocation();

    // Дістаємо дані зі сховища Redux
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const role = useSelector(selectUserRole);
    const isRefreshing = useSelector(selectIsRefreshing);

    // 1. ПЕРЕВІРКА ЗАВАНТАЖЕННЯ
    // Якщо додаток ще перевіряє сесію (після F5), ми не повинні нікуди перекидати.
    // Просто показуємо спіннер або пустоту, доки Redux не визначиться.
    if (isRefreshing) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Перевірка доступу...</div>;
    }

    // 2. ПЕРЕВІРКА АВТОРИЗАЦІЇ
    // Якщо перевірка закінчилась і юзер НЕ залогінений -> відправляємо на Логін.
    if (!isLoggedIn) {
        // state={{ from: location }} дозволить повернути юзера назад сюди після логіну
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. ПЕРЕВІРКА РОЛІ
    // Якщо ми передали список дозволених ролей, а роль юзера там відсутня -> доступ заборонено.
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Наприклад, Клієнт намагається зайти на /employee/all-orders
        // Перекидаємо його на Головну (або можна на сторінку 403 Forbidden)
        return <Navigate to="/" replace />;
    }

    // 4. ВСЕ ДОБРЕ -> Рендеримо сторінку
    return children;
};

export default ProtectedRoute;