import { Outlet } from 'react-router-dom';
import Header from './Header';
import CartDrawer from './CartDrawer';
import ToastContainer from './ToastContainer';

export default function AppLayout() {
    return (
        <>
            <Header />
            <Outlet />
            <footer className="site-footer">
                <p>ساخته شده با ❤️ در مسیر یادگیری وب</p>
            </footer>
            <CartDrawer />
            <ToastContainer />
        </>
    );
}