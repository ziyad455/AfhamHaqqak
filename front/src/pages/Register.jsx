import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        // Since no real auth, navigate to LoginPage
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-surface text-right">
            {/* Right Side - Image/Branding (Reversed for variation) */}
            <div className="hidden lg:flex w-1/2 relative bg-secondary flex-col justify-between p-12 overflow-hidden order-2">
                 <div className="relative z-10 flex justify-end">
                    <Link to="/" className="text-3xl font-black text-white hover:opacity-80 transition-opacity">افهم حقك</Link>
                </div>
                <div className="relative z-10 mt-auto text-right">
                    <blockquote className="text-2xl font-headline font-bold text-white leading-tight">
                        "رحلتك القانونية المُمكّنة تبدأ من هنا"
                    </blockquote>
                    <p className="text-secondary-fixed-dim text-md mt-4 max-w-sm mr-auto">انضم إلى آلاف المغاربة الذين يتصفحون النظام القانوني بثقة.</p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 -right-32 w-[600px] h-[600px] bg-secondary-container/20 rounded-full blur-3xl"></div>
            </div>

            {/* Left Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 bg-surface-container-lowest order-1">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8">
                        <Link to="/" className="text-3xl font-black text-secondary">افهم حقك</Link>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold text-on-surface mb-3 tracking-tight">إنشاء حساب</h1>
                        <p className="text-on-surface-variant">سجل للحصول على إرشادات قانونية مخصصة.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2 text-right">
                            <label htmlFor="name" className="block text-sm font-bold text-on-surface">الاسم الكامل</label>
                            <input 
                                type="text" 
                                id="name" 
                                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface placeholder:text-outline-variant text-right"
                                placeholder="جمال الدين"
                                required
                            />
                        </div>

                        <div className="space-y-2 text-right">
                            <label htmlFor="email" className="block text-sm font-bold text-on-surface">البريد الإلكتروني</label>
                            <input 
                                type="email" 
                                id="email" 
                                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface placeholder:text-outline-variant text-right"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2 text-right">
                            <label htmlFor="password" className="block text-sm font-bold text-on-surface">كلمة المرور</label>
                            <input 
                                type="password" 
                                id="password" 
                                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface placeholder:text-outline-variant text-right"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                         <div className="space-y-2 text-right">
                            <label htmlFor="confirm-password" className="block text-sm font-bold text-on-surface">تأكيد كلمة المرور</label>
                            <input 
                                type="password" 
                                id="confirm-password" 
                                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface placeholder:text-outline-variant text-right"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-bold text-lg hover:bg-secondary-container hover:text-on-secondary-container hover:shadow-lg hover:shadow-secondary/20 active:scale-[0.98] transition-all duration-200 mt-6"
                        >
                            إنشاء الحساب
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-on-surface-variant text-sm">
                            لديك حساب بالفعل؟{' '}
                            <Link to="/login" className="font-bold text-secondary hover:text-secondary-container transition-colors">
                                تسجيل الدخول
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
