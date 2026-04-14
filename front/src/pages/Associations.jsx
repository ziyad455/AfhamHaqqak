import React, { useState } from 'react';

const Associations = () => {
    return (
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen text-right">
            {/* Header Section */}
            <header className="mb-16 text-center max-w-3xl mx-auto">
                <span className="text-secondary font-semibold tracking-wider text-sm uppercase mb-4 block">الدعم المهني</span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
                    اعثر على <span className="text-secondary">الجمعية المناسبة</span>
                </h1>
                <p className="mt-6 text-lg text-on-surface-variant leading-relaxed">
                    تواصل مع المنظمات غير الحكومية والعيادات القانونية المغربية المعتمدة والمخصصة للدفاع عن حقوقك وتقديم المساعدة العملية.
                </p>
                
                {/* Search & Filter */}
                <div className="mt-10 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                    <div className="relative flex-grow">
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                        <input className="w-full pr-12 pl-4 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-secondary/20 shadow-sm transition-all text-right" placeholder="ابحث بالاسم، المنطقة، أو نوع المشكلة..." type="text" />
                    </div>
                    <button className="px-6 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors text-on-surface font-medium">
                        <span className="material-symbols-outlined">tune</span>
                        الفلاتر
                    </button>
                </div>
            </header>

            {/* Quick Categories */}
            <div className="flex flex-nowrap overflow-x-auto hide-scrollbar gap-3 mb-12 pb-4 justify-start">
                <button className="px-6 py-2.5 bg-secondary text-on-secondary rounded-full font-medium whitespace-nowrap shrink-0 shadow-md">جميع المنظمات</button>
                <button className="px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container-low rounded-full font-medium whitespace-nowrap shrink-0 transition-colors">حقوق المرأة</button>
                <button className="px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container-low rounded-full font-medium whitespace-nowrap shrink-0 transition-colors">الشغل والتوظيف</button>
                <button className="px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container-low rounded-full font-medium whitespace-nowrap shrink-0 transition-colors">حماية الطفولة</button>
                <button className="px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container-low rounded-full font-medium whitespace-nowrap shrink-0 transition-colors">حقوق المستهلك</button>
                <button className="px-6 py-2.5 bg-surface-container-lowest border border-outline-variant/20 hover:bg-surface-container-low rounded-full font-medium whitespace-nowrap shrink-0 transition-colors">عيادات قانونية مجانية</button>
            </div>

            {/* NGOs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* OMDH Card */}
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-xl hover:shadow-on-surface/5 transition-all duration-300 flex flex-col overflow-hidden text-right">
                    <div className="h-32 bg-secondary-container/20 relative">
                        <div className="absolute -bottom-10 right-6 w-20 h-20 bg-surface-container-lowest rounded-2xl border-4 border-surface-container-lowest shadow-sm flex items-center justify-center overflow-hidden">
                            <span className="text-secondary font-black text-2xl">OMDH</span>
                        </div>
                        <div className="absolute top-4 left-4 bg-surface-container-lowest/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs font-bold text-on-surface">معتمدة</span>
                        </div>
                    </div>
                    <div className="pt-14 px-6 pb-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-bold text-on-surface mb-1">المنظمة المغربية لحقوق الإنسان</h3>
                        <p className="text-xs text-secondary font-medium mb-4">حقوق الإنسان العامة • المقر الرئيسي بالرباط</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-grow">
                            واحدة من أقدم منظمات حقوق الإنسان في المغرب. تقدم التوجيه القانوني وتعمل على رفع مستوى الوعي حول انتهاكات الحقوق الأساسية.
                        </p>
                        <div className="space-y-3 mb-6 border-t border-outline-variant/10 pt-4">
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
                                <span>تغطية وطنية (فروع متعددة)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-outline text-[18px]">payments</span>
                                <span>استشارات مجانية</span>
                            </div>
                        </div>
                        <button className="w-full bg-secondary-fixed text-on-secondary-fixed py-3 rounded-xl font-bold hover:bg-secondary-fixed-dim transition-colors flex items-center justify-center gap-2">
                            اتصل بالمنظمة
                            <span className="material-symbols-outlined text-sm rotate-180">open_in_new</span>
                        </button>
                    </div>
                </div>

                {/* ADFM Card */}
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-xl hover:shadow-on-surface/5 transition-all duration-300 flex flex-col overflow-hidden text-right">
                    <div className="h-32 bg-error-container/20 relative">
                        <div className="absolute -bottom-10 right-6 w-20 h-20 bg-surface-container-lowest rounded-2xl border-4 border-surface-container-lowest shadow-sm flex items-center justify-center overflow-hidden">
                            <span className="text-error font-black text-2xl">ADFM</span>
                        </div>
                        <div className="absolute top-4 left-4 bg-surface-container-lowest/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs font-bold text-on-surface">معتمدة</span>
                        </div>
                    </div>
                    <div className="pt-14 px-6 pb-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-bold text-on-surface mb-1">الجمعية الديمقراطية لنساء المغرب</h3>
                        <p className="text-xs text-error font-medium mb-4">حقوق المرأة • الدار البيضاء</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-grow">
                            مكرسة للدفاع عن المصالح الإستراتيجية للمرأة. متخصصة في قضايا مدونة الأسرة، العنف ضد المرأة، وتعزيز المساواة بين الجنسين.
                        </p>
                        <div className="space-y-3 mb-6 border-t border-outline-variant/10 pt-4">
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
                                <span>مراكز بالدار البيضاء والرباط</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-outline text-[18px]">support_agent</span>
                                <span>مراكز استماع متخصصة</span>
                            </div>
                        </div>
                        <button className="w-full bg-secondary-fixed text-on-secondary-fixed py-3 rounded-xl font-bold hover:bg-secondary-fixed-dim transition-colors flex items-center justify-center gap-2">
                            اتصل بالمنظمة
                            <span className="material-symbols-outlined text-sm rotate-180">open_in_new</span>
                        </button>
                    </div>
                </div>

                {/* FMDC Card */}
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-xl hover:shadow-on-surface/5 transition-all duration-300 flex flex-col overflow-hidden text-right">
                    <div className="h-32 bg-primary-container/20 relative">
                        <div className="absolute -bottom-10 right-6 w-20 h-20 bg-surface-container-lowest rounded-2xl border-4 border-surface-container-lowest shadow-sm flex items-center justify-center overflow-hidden">
                            <span className="text-primary font-black text-2xl">FMDC</span>
                        </div>
                        <div className="absolute top-4 left-4 bg-surface-container-lowest/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-xs font-bold text-on-surface">معتمدة</span>
                        </div>
                    </div>
                    <div className="pt-14 px-6 pb-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-bold text-on-surface mb-1">الجامعة المغربية لحقوق المستهلك</h3>
                        <p className="text-xs text-primary font-medium mb-4">حماية المستهلك • المقر الرئيسي بالقنيطرة</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-grow">
                            تحمي مصالح المستهلك ضد الغش التجاري، الإعلانات المضللة، والمنتجات غير الآمنة. تدير شبابيك المستهلك عبر مدن مختلفة.
                        </p>
                        <div className="space-y-3 mb-6 border-t border-outline-variant/10 pt-4">
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
                                <span>شبابيك المستهلك في جميع أنحاء الوطن</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-outline text-[18px]">balance</span>
                                <span>الوساطة مع الشركات</span>
                            </div>
                        </div>
                        <button className="w-full bg-secondary-fixed text-on-secondary-fixed py-3 rounded-xl font-bold hover:bg-secondary-fixed-dim transition-colors flex items-center justify-center gap-2">
                            اتصل بالمنظمة
                            <span className="material-symbols-outlined text-sm rotate-180">open_in_new</span>
                        </button>
                    </div>
                </div>

                {/* Clinique Juridique Card */}
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-xl hover:shadow-on-surface/5 transition-all duration-300 flex flex-col overflow-hidden text-right">
                    <div className="h-32 bg-tertiary-container/20 relative">
                        <div className="absolute -bottom-10 right-6 w-20 h-20 bg-surface-container-lowest rounded-2xl border-4 border-surface-container-lowest shadow-sm flex items-center justify-center overflow-hidden">
                            <span className="text-tertiary font-black text-2xl">CJU</span>
                        </div>
                    </div>
                    <div className="pt-14 px-6 pb-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-bold text-on-surface mb-1">العيادة القانونية الجامعية</h3>
                        <p className="text-xs text-tertiary font-medium mb-4">المساعدة القانونية • جامعات متعددة</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-grow">
                            طلاب القانون تحت إشراف الأساتذة والمحامين الممارسين يقدمون استشارات قانونية مجانية للفئات الهشة.
                        </p>
                        <div className="space-y-3 mb-6 border-t border-outline-variant/10 pt-4">
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
                                <span>الرباط (UM5)، فاس (USMBA)، مراكش (UCA)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
                                <span>خلال السنة الجامعية فقط</span>
                            </div>
                        </div>
                        <button className="w-full bg-secondary-fixed text-on-secondary-fixed py-3 rounded-xl font-bold hover:bg-secondary-fixed-dim transition-colors flex items-center justify-center gap-2">
                            اتصل بالمنظمة
                            <span className="material-symbols-outlined text-sm rotate-180">open_in_new</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* CTA Section */}
            <div className="mt-20 bg-secondary-container rounded-[2.5rem] p-12 text-center text-on-secondary-container">
                <h2 className="text-3xl font-extrabold mb-4">هل أنت جمعية معترف بها قانونياً؟</h2>
                <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">انضم إلى دليلنا للتواصل مع المواطنين الذين يحتاجون إلى خبرتك. نحن نقوم بمراجعة جميع المنظمات يدوياً لضمان الثقة والجودة.</p>
                <button className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-md">
                    قدم طلب الإدراج
                </button>
            </div>
        </main>
    );
};

export default Associations;
