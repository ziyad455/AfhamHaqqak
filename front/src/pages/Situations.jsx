import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeScenario } from '../api';

const SITUATIONS = [
    {
        slug: 'fired-from-work',
        icon: 'work_off',
        title: 'طرد من العمل',
        description: 'الفصل التعسفي، الأجور غير المدفوعة، أو خرق عقد العمل بموجب قانون الشغل المغربي.',
        color: 'primary',
        scenario: 'أنا كنخدم فشركة خاصة وبغاو يوقفوني من الخدمة بلا إنذار مكتوب. شنو الحقوق ديالي؟',
    },
    {
        slug: 'landlord-dispute',
        icon: 'home_work',
        title: 'نزاع الكراء',
        description: 'إشعارات الإفراغ، استرداد مبلغ الضمان (الضمانة)، وواجبات الصيانة.',
        color: 'tertiary',
        scenario: 'Je suis locataire à Casablanca et le propriétaire veut m\'expulser sans préavis écrit. Quelle base juridique peut s\'appliquer?',
    },
    {
        slug: 'family-issue',
        icon: 'family_restroom',
        title: 'مشاكل أسرية',
        description: 'الطلاق، حضانة الأطفال، الميراث، ومساطر مدونة الأسرة.',
        color: 'secondary',
        scenario: 'زوجتي بغات الطلاق وعندنا ولاد صغار. شنو كتقول مدونة الأسرة على الحضانة؟',
    },
    {
        slug: 'fraud-or-scam',
        icon: 'gpp_maybe',
        title: 'نصب أو احتيال',
        description: 'سرقة الهوية، الاحتيال المالي الرقمي، أو التضليل في العقود.',
        color: 'error',
        scenario: 'تعرضت للنصب عبر الإنترنت وخسرت فلوسي. شنو الإجراءات القانونية اللي نقدر ندير؟',
    },
    {
        slug: 'police-issue',
        icon: 'policy',
        title: 'مشاكل مع الشرطة',
        description: 'حقوق التفاعل، قواعد الحراسة النظرية، وبروتوكولات التمثيل القانوني.',
        color: 'slate-900',
        scenario: 'واحد الشخص تشد من طرف الشرطة وبقى مدة طويلة قبل ما يتقدم للنيابة. quelles garanties procédurales peuvent s\'appliquer?',
    },
    {
        slug: 'consumer-rights',
        icon: 'shopping_cart_checkout',
        title: 'حقوق المستهلك',
        description: 'المنتجات المعيبة، الإعلانات المضللة، أو مطالبات استرداد الأموال.',
        color: 'primary',
        scenario: 'شريت منتوج من الأنترنت وجا معطوب وبائع مابغاش يرجعلي الفلوس. شنو حقوقي كمستهلك؟',
    },
];

const Situations = () => {
    const navigate = useNavigate();
    const [scenario, setScenario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        const text = scenario.trim();
        if (!text || text.length < 3) {
            setError('يرجى وصف حالتك في بضع كلمات على الأقل.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const result = await analyzeScenario(text);
            navigate('/detail/custom', { state: { analysis: result, scenario: text } });
        } catch (err) {
            setError(err.message || 'فشل التحليل. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (situation) => {
        navigate(`/detail/${situation.slug}`, {
            state: { scenario: situation.scenario, title: situation.title, icon: situation.icon },
        });
    };

    const colorMap = {
        primary: { bg: 'bg-primary/5', text: 'text-primary' },
        tertiary: { bg: 'bg-tertiary/5', text: 'text-tertiary' },
        secondary: { bg: 'bg-secondary/5', text: 'text-secondary' },
        error: { bg: 'bg-error/5', text: 'text-error' },
        'slate-900': { bg: 'bg-slate-900/5', text: 'text-slate-900' },
    };

    return (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen text-right">
            {/* Header */}
            <header className="mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-2xl">
                        <span className="text-primary font-semibold tracking-wider text-sm uppercase mb-4 block">افهم حقك</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
                            ما هي <span className="text-primary">حالتك؟</span>
                        </h1>
                        <p className="mt-6 text-lg text-on-surface-variant max-w-lg leading-relaxed">
                            اختر فئة أدناه أو صف حالتك بالتفصيل. سيقوم مساعدنا القانوني الذكي بتحليل القانون المغربي المطبق لحالتك.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse text-on-surface-variant text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span>المساعد الذكي متصل</span>
                    </div>
                </div>
            </header>

            {/* Natural Language Input */}
            <section className="max-w-4xl mx-auto mb-20">
                <div className="bg-surface-container-low/50 p-1 rounded-[2.5rem] border border-outline-variant/20">
                    <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2.25rem] shadow-xl shadow-on-surface/5">
                        <div className="mb-8 text-center text-center">
                            <h2 className="text-2xl font-bold mb-2">لم تجد حالتك؟</h2>
                            <p className="text-on-surface-variant">صف حالتك بكلماتك الخاصة - بالعربية، الدارجة، أو الفرنسية. سيقوم خبيرنا القانوني بتوجيهك.</p>
                        </div>
                        <div className="relative">
                            <textarea
                                className="w-full bg-surface-container-low border-none rounded-2xl p-6 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20 transition-all text-lg resize-none text-right"
                                placeholder="'تطردت من الخدمة بلا سبب...' أو 'Mon propriétaire refuse de me rendre la caution...'"
                                rows="6"
                                value={scenario}
                                onChange={(e) => { setScenario(e.target.value); setError(''); }}
                                disabled={loading}
                            />
                            <div className="absolute bottom-4 left-4 flex items-center space-x-2 space-x-reverse text-xs text-outline font-medium">
                                <span>بناءً على القانون المغربي</span>
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                            </div>
                        </div>
                        {error && (
                            <div className="mt-4 p-3 bg-error/10 text-error text-sm rounded-xl font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {error}
                            </div>
                        )}
                        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">smart_toy</span>
                                <span className="text-sm text-on-surface-variant font-medium">مدعوم بتقنية الذكاء الاصطناعي</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || scenario.trim().length < 3}
                                className="w-full md:w-auto bg-primary text-on-primary px-10 py-4 rounded-2xl font-bold text-lg hover:bg-primary-container transition-all active:scale-95 duration-200 shadow-lg shadow-primary/20 flex items-center justify-center space-x-3 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
                                        <span>جاري التحليل...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>حلل حالتي</span>
                                        <span className="material-symbols-outlined">send</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Situations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SITUATIONS.map((sit) => {
                    const colors = colorMap[sit.color] || colorMap.primary;
                    return (
                        <button
                            key={sit.slug}
                            onClick={() => handleCategoryClick(sit)}
                            className="group bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 hover:shadow-2xl hover:shadow-on-surface/5 transition-all duration-300 flex flex-col justify-between cursor-pointer text-right"
                        >
                            <div>
                                <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center ${colors.text} mb-6 group-hover:scale-110 transition-transform duration-300 self-start`}>
                                    <span className="material-symbols-outlined text-3xl">{sit.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{sit.title}</h3>
                                <p className="text-on-surface-variant text-sm leading-relaxed">{sit.description}</p>
                            </div>
                            <div className={`mt-8 flex items-center ${colors.text} font-bold text-sm justify-end`}>
                                حلل هذه الحالة <span className="material-symbols-outlined mr-2 text-sm group-hover:-translate-x-1 transition-transform rotate-180">arrow_forward</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </main>
    );
};

export default Situations;
