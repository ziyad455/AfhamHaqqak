import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    
    // Check if the current path matches the link
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-50/60 backdrop-blur-xl shadow-sm h-20">
            <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-full">
                <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">افهم حقك</Link>
                <div className="hidden md:flex items-center space-x-8 space-x-reverse">
                    <Link to="/" className={`${isActive('/') ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : 'text-slate-600 hover:text-slate-900 transition-colors'}`}>الرئيسية</Link>
                    <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">الدعم</a>
                    <Link to="/situations" className={`${isActive('/situations') ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : 'text-slate-600 hover:text-slate-900 transition-colors'}`}>الحالات</Link>
                    <Link to="/associations" className={`${isActive('/associations') ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : 'text-slate-600 hover:text-slate-900 transition-colors'}`}>الجمعيات</Link>
                </div>
                <div className="flex items-center gap-4">
                     <Link to="/login" className="hidden md:block text-slate-600 font-semibold hover:text-slate-900 transition-colors">تسجيل الدخول</Link>
                    <Link to="/situations" className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-semibold scale-95 active:scale-90 duration-200 shadow-lg shadow-primary/20 hover:opacity-90">
                        ابدأ الآن
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
