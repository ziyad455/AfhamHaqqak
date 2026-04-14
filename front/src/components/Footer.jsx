const Footer = () => {
    return (
        <footer className="w-full py-12 mt-auto bg-slate-900">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col gap-4">
                    <div className="text-2xl font-black text-white">افهم حقك</div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        تمكين المواطنين المغاربة من خلال المعرفة القانونية الميسرة وربطهم بالدعم المهني.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                        <h5 className="font-headline text-lg text-white font-bold">المنصة</h5>
                        <a className="text-slate-400 hover:text-blue-400 transition-colors text-sm" href="#">سياسة الخصوصية</a>
                        <a className="text-slate-400 hover:text-blue-400 transition-colors text-sm" href="#">شروط الخدمة</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h5 className="font-headline text-lg text-white font-bold">الدعم</h5>
                        <a className="text-slate-400 hover:text-blue-400 transition-colors text-sm" href="#">إخلاء المسؤولية القانونية</a>
                        <a className="text-slate-400 hover:text-blue-400 transition-colors text-sm" href="#">الاتصال بالدعم</a>
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    <p className="text-slate-400 text-sm">© 2026 افهم حقك. جميع الحقوق محفوظة. إرشادات قانونية للمغرب.</p>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-xl">share</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-primary transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-xl">mail</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
export default Footer;
