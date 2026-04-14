import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Since no real auth, navigate to HomePage
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-surface text-right">
            {/* Left Side - Image/Branding (Hidden on mobile) - Swapped for RTL logic if needed, but flex handles order */}
            <div className="hidden lg:flex w-1/2 relative bg-primary flex-col justify-between p-12 overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="text-3xl font-black text-white hover:opacity-80 transition-opacity">افهم حقك</Link>
                    <p className="text-primary-fixed-dim text-lg mt-4 max-w-md">تمكينكم بالمعرفة القانونية الميسرة والدعم في جميع أنحاء المغرب.</p>
                </div>
                <div className="relative z-10 mt-auto">
                    <blockquote className="text-2xl font-headline font-bold text-white leading-tight">
                        "العدالة متاحة عندما تعرف حقوقك"
                    </blockquote>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-primary-container/30 rounded-full blur-3xl"></div>
                <div className="absolute top-20 -right-20 w-[300px] h-[300px] bg-secondary-container/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 bg-surface-container-lowest">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8">
                        <Link to="/" className="text-3xl font-black text-primary">افهم حقك</Link>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold text-on-surface mb-3 tracking-tight">مرحباً بعودتك</h1>
                        <p className="text-on-surface-variant">سجل الدخول لتتبع استفساراتك القانونية ورسائلك.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 text-right">
                            <label htmlFor="email" className="block text-sm font-bold text-on-surface">البريد الإلكتروني</label>
                            <input 
                                type="email" 
                                id="email" 
                                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant text-right"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2 text-right">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="block text-sm font-bold text-on-surface">كلمة المرور</label>
                                <a href="#" className="text-sm font-bold text-primary hover:text-primary-container transition-colors">نسيت؟</a>
                            </div>
                            <input 
                                type="password" 
                                id="password" 
                                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline-variant text-right"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-lg hover:bg-primary-container hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200 mt-4"
                        >
                            تسجيل الدخول
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-on-surface-variant text-sm">
                            ليس لديك حساب بعد؟{' '}
                            <Link to="/register" className="font-bold text-primary hover:text-primary-container transition-colors">
                                أنشئ حساباً
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
