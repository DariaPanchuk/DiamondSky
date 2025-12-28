import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Navigation from '../Navigation/Navigation';

const Layout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Навігація */}
            <Navigation />

            {/* Контент сторінки */}
            <main style={{ flexGrow: 1 }}>
                <Suspense fallback={<div style={{padding:'20px'}}>Завантаження сторінки...</div>}>
                    <Outlet />
                </Suspense>
            </main>

            {/* Футер */}
            <footer style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', color: '#7f8c8d' }}>
                &copy; 2025 Jewelry Workshop "DiamondSky" | Всі права захищено
            </footer>
        </div>
    );
};

export default Layout;