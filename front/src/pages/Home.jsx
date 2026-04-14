import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <main className="pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-surface py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="z-10 text-right lg:text-right">
                        <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.1] mb-8 tracking-tight">
                            افهم حقوقك، <span className="text-primary">وافعل الصواب</span>
                        </h1>
                        <p className="font-body text-lg md:text-xl text-on-surface-variant mb-10 max-w-xl leading-relaxed">
                            تصفح المشهد القانوني المغربي بكل ثقة. نحن نقدم لك إرشادات ميسرة واحترافية مصممة خصيصاً لوضعك القانوني الخاص.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-start overflow-hidden">
                            <Link to="/situations" className="px-8 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:bg-primary-container transition-all editorial-shadow flex items-center gap-2">
                                جربه الآن
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>arrow_forward</span>
                            </Link>
                            <button className="px-8 py-4 bg-surface-container-lowest text-primary rounded-xl font-bold text-lg border border-outline-variant/20 hover:bg-surface-bright transition-all editorial-shadow">
                                لمعرفة المزيد
                            </button>
                        </div>
                    </div>
                    <div className="relative lg:h-[600px] rounded-3xl overflow-hidden editorial-shadow">
                        <img alt="العدالة القانونية" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq68lYZM32iRWSZEVLp_AlkIgN0QFtTVzGU9ARl2TQuh5T_JgWfLUJRf46FbMcYR0RRjmfKPetJuFmoLVcg29FawbDwa5ClmK977ANDIbLCI56EoLUHcdVwCJuTMbDcQBvoATKdGMwq9vITdrvaIGCSepvc2wg90mvbUtfP-bdetQ2CKO-wLBBZmcd-Mph-E3H4E1yLCRqHz2Ho31KOS0UtzSawkL8RZFwGjh_UGCJb3GLo77h22qGp_uW00xzZVMMN1l02Mp30pk" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                    </div>
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl"></div>
            </section>

            {/* Rights Horizontal Scroll */}
            <section className="py-12 bg-surface-container-low border-y border-outline-variant/10 overflow-hidden">
                <div className="auto-scroll">
                    {/* Card 1 */}
                    <div className="w-80 shrink-0 bg-surface-container-lowest p-6 rounded-2xl editorial-shadow flex flex-col gap-4 text-right">
                        <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary self-start">
                            <span className="material-symbols-outlined">work</span>
                        </div>
                        <h3 className="font-headline font-bold text-xl">حقوق الشغل</h3>
                        <p className="text-sm text-on-surface-variant">حماية الموظفين المغاربة في ما يخص ساعات العمل، السلامة، والأجر العادل.</p>
                    </div>
                    {/* Card 2 */}
                    <div className="w-80 shrink-0 bg-surface-container-lowest p-6 rounded-2xl editorial-shadow flex flex-col gap-4 text-right">
                        <div className="w-12 h-12 bg-secondary-fixed rounded-xl flex items-center justify-center text-secondary self-start">
                            <span className="material-symbols-outlined">family_restroom</span>
                        </div>
                        <h3 className="font-headline font-bold text-xl">مدونة الأسرة</h3>
                        <p className="text-sm text-on-surface-variant">فهم مقتضيات مدونة الأسرة في ما يتعلق بالزواج، الطلاق، والحضانة.</p>
                    </div>
                    {/* Card 3 */}
                    <div className="w-80 shrink-0 bg-surface-container-lowest p-6 rounded-2xl editorial-shadow flex flex-col gap-4 text-right">
                        <div className="w-12 h-12 bg-tertiary-fixed rounded-xl flex items-center justify-center text-tertiary self-start">
                            <span className="material-symbols-outlined">gavel</span>
                        </div>
                        <h3 className="font-headline font-bold text-xl">حماية المستهلك</h3>
                        <p className="text-sm text-on-surface-variant">حقوقك كمستهلك في الأسواق المغربية الرقمية والواقعية.</p>
                    </div>
                    {/* Card 4 */}
                    <div className="w-80 shrink-0 bg-surface-container-lowest p-6 rounded-2xl editorial-shadow flex flex-col gap-4 text-right">
                        <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary self-start">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <h3 className="font-headline font-bold text-xl">المرافق العمومية</h3>
                        <p className="text-sm text-on-surface-variant">تسهيل المساطر الإدارية والتفاعل مع الإدارات والمؤسسات العمومية.</p>
                    </div>
                    {/* Repeated for Seamless Loop */}
                    <div className="w-80 shrink-0 bg-surface-container-lowest p-6 rounded-2xl editorial-shadow flex flex-col gap-4 text-right">
                        <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary self-start">
                            <span className="material-symbols-outlined">work</span>
                        </div>
                        <h3 className="font-headline font-bold text-xl">حقوق الشغل</h3>
                        <p className="text-sm text-on-surface-variant">حماية الموظفين المغاربة في ما يخص ساعات العمل، السلامة، والأجر العادل.</p>
                    </div>
                    <div className="w-80 shrink-0 bg-surface-container-lowest p-6 rounded-2xl editorial-shadow flex flex-col gap-4 text-right">
                        <div className="w-12 h-12 bg-secondary-fixed rounded-xl flex items-center justify-center text-secondary self-start">
                            <span className="material-symbols-outlined">family_restroom</span>
                        </div>
                        <h3 className="font-headline font-bold text-xl">مدونة الأسرة</h3>
                        <p className="text-sm text-on-surface-variant">فهم مقتضيات مدونة الأسرة في ما يتعلق بالزواج، الطلاق، والحضانة.</p>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-32 bg-background">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-6">طريق بسيط نحو العدالة</h2>
                        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Step 1 */}
                        <div className="group relative bg-surface-container-lowest p-10 rounded-3xl editorial-shadow hover:-translate-y-2 transition-all duration-300 text-right">
                            <div className="text-6xl font-headline font-black text-primary/10 absolute top-4 left-6 group-hover:text-primary/20 transition-colors">01</div>
                            <div className="mb-8">
                                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_searching</span>
                            </div>
                            <h4 className="font-headline text-2xl font-bold mb-4">اختر الحالة</h4>
                            <p className="text-on-surface-variant leading-relaxed">حدد مشكلتك القانونية الخاصة من بين فئاتنا المختارة من الحياة اليومية.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="group relative bg-surface-container-lowest p-10 rounded-3xl editorial-shadow hover:-translate-y-2 transition-all duration-300 text-right">
                            <div className="text-6xl font-headline font-black text-primary/10 absolute top-4 left-6 group-hover:text-primary/20 transition-colors">02</div>
                            <div className="mb-8">
                                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                            </div>
                            <h4 className="font-headline text-2xl font-bold mb-4">اكتشف حقوقك</h4>
                            <p className="text-on-surface-variant leading-relaxed">اقرأ تفسيرات واضحة ومبسطة لما يقوله القانون تماماً في سياق حالتك.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="group relative bg-surface-container-lowest p-10 rounded-3xl editorial-shadow hover:-translate-y-2 transition-all duration-300 text-right">
                            <div className="text-6xl font-headline font-black text-primary/10 absolute top-4 left-6 group-hover:text-primary/20 transition-colors">03</div>
                            <div className="mb-8">
                                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>ads_click</span>
                            </div>
                            <h4 className="font-headline text-2xl font-bold mb-4">اتبع الإجراءات</h4>
                            <p className="text-on-surface-variant leading-relaxed">احصل على قائمة بالخطوات المباشرة والمساطر والمستندات المطلوبة.</p>
                        </div>
                        {/* Step 4 */}
                        <div className="group relative bg-surface-container-lowest p-10 rounded-3xl editorial-shadow hover:-translate-y-2 transition-all duration-300 text-right">
                            <div className="text-6xl font-headline font-black text-primary/10 absolute top-4 left-6 group-hover:text-primary/20 transition-colors">04</div>
                            <div className="mb-8">
                                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_3</span>
                            </div>
                            <h4 className="font-headline text-2xl font-bold mb-4">تواصل مع جمعية</h4>
                            <p className="text-on-surface-variant leading-relaxed">تواصل مباشرة مع المنظمات غير الحكومية والخبراء القانونيين المعتمدين للدعم العملي.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
