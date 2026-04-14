import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { analyzeScenario, chatWithAssistant } from '../api';

const Detail = () => {
    const location = useLocation();
    const { slug } = useParams();
    const chatEndRef = useRef(null);

    // Analysis state
    const [analysis, setAnalysis] = useState(location.state?.analysis || null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState('');
    const [scenarioText, setScenarioText] = useState(location.state?.scenario || '');
    const [pageTitle, setPageTitle] = useState(location.state?.title || 'تحليل قانوني');
    const [pageIcon, setPageIcon] = useState(location.state?.icon || 'gavel');

    // Chat state
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Fetch analysis if we only have a scenario (category card click)
    useEffect(() => {
        if (!analysis && scenarioText) {
            setAnalysisLoading(true);
            analyzeScenario(scenarioText)
                .then((result) => {
                    setAnalysis(result);
                    setAnalysisError('');
                })
                .catch((err) => {
                    setAnalysisError(err.message || 'فشل في جلب التحليل.');
                })
                .finally(() => setAnalysisLoading(false));
        }
    }, []);

    // Set initial chat greeting once analysis is ready
    useEffect(() => {
        if (analysis && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                text: `مرحباً! لقد قمت بتحليل حالتك بخصوص "${pageTitle}". يمكنني مساعدتك في فهم التوجيه القانوني، أو توضيح حقوقك، أو شرح الخطوات التالية. ماذا تريد أن تعرف؟`,
            }]);
        }
    }, [analysis]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleChat = async (messageText) => {
        const text = (messageText || chatInput).trim();
        if (!text || !analysis) return;

        const userMsg = { role: 'user', text };
        setMessages((prev) => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);

        try {
            const result = await chatWithAssistant({
                message: text,
                situation_summary: analysis.summary,
                guidance_message: analysis.next_steps?.join('. ') || '',
                source_lines: analysis.citations?.map((c) => `${c.title} (${c.date}): ${c.excerpt}`) || [],
            });
            setMessages((prev) => [...prev, { role: 'assistant', text: result.answer }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'assistant', text: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    };

    const confidenceColor = {
        high: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-red-100 text-red-800',
    };

    const confidenceText = {
        high: 'ثقة عالية',
        medium: 'ثقة متوسطة',
        low: 'ثقة منخفضة',
    };

    return (
        <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col text-right">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-slate-50/60 backdrop-blur-xl shadow-sm h-20">
                <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">افهم حقك</Link>
                        <div className="hidden md:flex gap-6 space-x-6 space-x-reverse">
                            <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">الرئيسية</Link>
                            <Link to="/situations" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">الحالات</Link>
                            <Link to="/associations" className="text-slate-600 hover:text-slate-900 transition-colors">الجمعيات</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/situations" className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-all flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm rotate-180">arrow_back</span>
                            تحليل جديد
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Layout */}
            <main className="pt-20 flex-grow flex">
                {/* Right Sidebar Chatbot (flipped from left to right for RTL) */}
                <aside className="hidden lg:flex w-96 fixed right-0 top-20 bottom-0 border-l border-outline-variant/20 bg-surface-container-low flex-col z-40">
                    <div className="p-6 border-b border-outline-variant/20">
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined">smart_toy</span>
                            المساعد القانوني
                        </h3>
                        <p className="text-sm text-on-surface-variant mt-1">اسألني أي شيء عن حالتك. سأستخدم التحليل أعلاه لمساعدتك.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`p-4 rounded-xl text-sm leading-relaxed ${
                                msg.role === 'assistant'
                                    ? 'bg-surface-container-lowest shadow-sm border border-outline-variant/10'
                                    : 'bg-primary/10 text-on-surface mr-4'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10 flex items-center gap-2 text-sm text-on-surface-variant">
                                <span className="animate-spin material-symbols-outlined text-primary text-base">progress_activity</span>
                                جاري التفكير...
                            </div>
                        )}
                        <div ref={chatEndRef} />

                        {/* Quick Action Chips */}
                        {analysis && messages.length <= 1 && (
                            <div className="flex flex-wrap gap-2 pt-2 justify-start">
                                {['اشرح لي ببساطة', 'ماذا أفعل أولاً؟', 'ما هي الوثائق المطلوبة؟', 'لخص لي حقوقي'].map((chip) => (
                                    <button
                                        key={chip}
                                        onClick={() => handleChat(chip)}
                                        disabled={chatLoading}
                                        className="px-3 py-1.5 bg-secondary-container/30 text-on-secondary-container text-xs font-medium rounded-full border border-secondary-container/50 hover:bg-secondary-container transition-colors disabled:opacity-50"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/20">
                        <div className="relative flex items-center">
                            <input
                                className="w-full pr-4 pl-12 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm text-right"
                                placeholder={analysis ? "اكتب سؤالك هنا..." : "في انتظار التحليل..."}
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={!analysis || chatLoading}
                            />
                            <button
                                onClick={() => handleChat()}
                                disabled={!analysis || chatLoading || !chatInput.trim()}
                                className="absolute left-2 p-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all active:scale-90 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm rotate-180">send</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Content Area (shifted to the left because sidebar is on the right) */}
                <section className="flex-1 lg:mr-96 p-8 md:p-12 max-w-5xl">
                    {/* Loading State */}
                    {analysisLoading && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <span className="animate-spin material-symbols-outlined text-primary text-5xl mb-6">progress_activity</span>
                            <h2 className="text-2xl font-bold mb-2">جاري تحليل حالتك...</h2>
                            <p className="text-on-surface-variant max-w-md">يقوم خبيرنا الذكي بالبحث في النصوص القانونية المغربية للعثور على أدق التوجيهات لحالتك.</p>
                        </div>
                    )}

                    {/* Error State */}
                    {analysisError && !analysisLoading && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <span className="material-symbols-outlined text-error text-5xl mb-6">error</span>
                            <h2 className="text-2xl font-bold mb-2 text-error">فشل التحليل</h2>
                            <p className="text-on-surface-variant max-w-md mb-6">{analysisError}</p>
                            <Link to="/situations" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container transition-all">
                                حاول مرة أخرى
                            </Link>
                        </div>
                    )}

                    {/* Analysis Results */}
                    {analysis && !analysisLoading && (
                        <>
                            {/* Header */}
                            <header className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">تحليل قانوني</span>
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${confidenceColor[analysis.confidence] || confidenceColor.low}`}>
                                        {confidenceText[analysis.confidence] || confidenceText.low}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 tracking-tight leading-tight">{pageTitle}</h1>
                            </header>

                            {/* Summary & Uncertainty */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
                                <div className="md:col-span-8">
                                    <h2 className="text-2xl font-bold mb-4">ماذا يعني هذا بالنسبة لك؟</h2>
                                    <div className="space-y-4 text-on-surface-variant leading-relaxed">
                                        <p className="text-base">{analysis.summary}</p>
                                    </div>
                                </div>
                                <div className="md:col-span-4 bg-primary-container rounded-2xl p-6 text-on-primary-container flex flex-col justify-center">
                                    <span className="material-symbols-outlined text-4xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                                    <h4 className="font-bold mb-2">ملاحظة حول الدقة</h4>
                                    <p className="text-sm opacity-90">{analysis.uncertainty}</p>
                                </div>
                            </div>

                            {/* Legal Basis & Citations */}
                            <div className="bg-surface-container-lowest rounded-3xl p-8 mb-16 shadow-sm border border-outline-variant/10">
                                <h2 className="text-2xl font-bold mb-8">الأساس القانوني والاستشهادات</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">verified_user</span>
                                            المرجعية القانونية
                                        </h3>
                                        <ul className="space-y-4">
                                            {analysis.legal_basis?.map((basis, i) => (
                                                <li key={i} className="flex gap-3">
                                                    <span className="material-symbols-outlined text-primary text-sm mt-1 shrink-0">check_circle</span>
                                                    <span className="text-on-surface-variant text-sm">{basis}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">description</span>
                                            وثائق المصدر
                                        </h3>
                                        <ul className="space-y-4">
                                            {analysis.citations?.map((cite, i) => (
                                                <li key={i} className="p-3 bg-surface-container rounded-xl border border-outline-variant/10">
                                                    <div className="font-semibold text-sm text-on-surface mb-1">{cite.title}</div>
                                                    <div className="text-xs text-on-surface-variant mb-2">
                                                        {cite.file_name} • {cite.date}
                                                    </div>
                                                    {cite.excerpt && (
                                                        <p className="text-xs text-on-surface-variant italic border-r-2 border-primary/30 pr-3">"{cite.excerpt}"</p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps */}
                            {analysis.next_steps?.length > 0 && (
                                <div className="mb-16">
                                    <h2 className="text-2xl font-bold mb-8">الخطوات الموصى بها</h2>
                                    <div className="relative space-y-8 before:absolute before:inset-0 before:mr-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
                                        {analysis.next_steps.map((step, i) => (
                                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${i === 0 ? 'border-primary bg-background text-primary' : 'border-outline bg-background text-outline'} font-bold shadow-sm z-10 shrink-0 md:order-1 md:group-odd:translate-x-1/2 md:group-even:-translate-x-1/2`}>
                                                    {i + 1}
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm text-right">
                                                    <p className="text-sm text-on-surface-variant">{step}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mobile Chat */}
                            <div className="lg:hidden mb-16">
                                <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">smart_toy</span>
                                        اسأل المساعد القانوني
                                    </h3>
                                    <div className="max-h-64 overflow-y-auto space-y-3 mb-4 hide-scrollbar">
                                        {messages.map((msg, i) => (
                                            <div key={i} className={`p-3 rounded-xl text-sm ${
                                                msg.role === 'assistant' ? 'bg-surface-container' : 'bg-primary/10 mr-4'
                                            }`}>
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div className="p-3 rounded-xl bg-surface-container text-sm flex items-center gap-2">
                                                <span className="animate-spin material-symbols-outlined text-primary text-base">progress_activity</span>
                                                جاري التفكير...
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative flex items-center">
                                        <input
                                            className="w-full pr-4 pl-12 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm text-right"
                                            placeholder="اكتب سؤالك هنا..."
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            disabled={chatLoading}
                                        />
                                        <button
                                            onClick={() => handleChat()}
                                            disabled={chatLoading || !chatInput.trim()}
                                            className="absolute left-2 p-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all active:scale-90 disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-sm rotate-180">send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <footer className="mt-20 pt-8 border-t border-outline-variant/20">
                                <div className="flex items-start gap-4 p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10">
                                    <span className="material-symbols-outlined text-tertiary">info</span>
                                    <p className="text-xs text-tertiary leading-relaxed">
                                        <strong>إخلاء مسؤولية قانوني:</strong> المعلومات المقدمة في "افهم حقك" هي لأغراض تعليمية فقط ولا تشكل استشارة قانونية رسمية. بينما نسعى جاهدين للدقة بناءً على القانون المغربي، يجب عليك استشارة محامٍ مؤهل للحصول على تفاصيل قضيتك المحددة.
                                    </p>
                                </div>
                            </footer>
                        </>
                    )}
                </section>
            </main>

            {/* Global Footer */}
            <footer className="w-full py-12 mt-auto bg-slate-900 lg:pr-96">
                <div className="max-w-5xl mx-auto px-8 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div className="text-2xl font-black text-white">افهم حقك</div>
                        <p className="text-slate-400 text-sm leading-relaxed">© 2024 افهم حقك. جميع الحقوق محفوظة. إرشادات قانونية للمغرب.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 col-span-2">
                        <div className="space-y-3">
                            <h4 className="text-white font-bold mb-4">التنقل</h4>
                            <Link to="/" className="block text-slate-400 hover:text-blue-400 text-sm transition-colors">الرئيسية</Link>
                            <Link to="/situations" className="block text-slate-400 hover:text-blue-400 text-sm transition-colors">الحالات</Link>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-white font-bold mb-4">المساعدة</h4>
                            <Link to="/associations" className="block text-slate-400 hover:text-blue-400 text-sm transition-colors">الجمعيات</Link>
                            <Link to="/situations" className="block text-slate-400 hover:text-blue-400 text-sm transition-colors">تحليل جديد</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Detail;
