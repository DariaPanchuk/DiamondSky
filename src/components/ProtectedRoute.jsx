import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
    selectIsLoggedIn, 
    selectUserRole, 
    selectIsRefreshing 
} from '../redux/auth/selectors';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const location = useLocation();
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const role = useSelector(selectUserRole);
    const isRefreshing = useSelector(selectIsRefreshing);

    if (isRefreshing) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Перевірка доступу...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;