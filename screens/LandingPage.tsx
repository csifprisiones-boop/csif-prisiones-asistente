import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            title: 'Gestor de Turnos',
            desc: 'Calendario inteligente con cuadrantes y estadísticas automáticas.',
            icon: 'calendar_month',
            color: 'bg-blue-500'
        },
        {
            title: 'Asistente IA',
            desc: 'Analiza documentos, normativas y vídeos con inteligencia artificial.',
            icon: 'smart_toy',
            color: 'bg-green-500'
        },
        {
            title: 'Biblioteca Legal',
            desc: 'Acceso instantáneo a toda la normativa penitenciaria oficial.',
            icon: 'library_books',
            color: 'bg-purple-500'
        }
    ];

    return (
        <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#101622] text-[#111318] dark:text-white font-display overflow-x-hidden selection:bg-primary selection:text-white">
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-csif-green blur-[120px] rounded-full animate-pulse delay-700"></div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[-100%] opacity-0'}`}>
                <div className="flex items-center gap-2">
                    <div className="bg-white dark:bg-surface-dark p-1.5 rounded-xl shadow-soft">
                        <img src="/csif-logo-3d.png" alt="CSIF" className="h-8 w-auto" />
                    </div>
                    <span className="font-extrabold text-sm tracking-tighter uppercase dark:text-white">
                        Prisiones <span className="text-primary tracking-normal font-medium">Asistente</span>
                    </span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-100 dark:border-gray-800 shadow-soft hover:scale-105 transition-transform"
                >
                    Ingresar
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-6 max-w-lg mx-auto flex flex-col items-center text-center">
                {/* Animated Badge */}
                <div className={`mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-1000 delay-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Plataforma Exclusiva CSIF
                </div>

                {/* Main Title */}
                <h1 className={`text-4xl sm:text-5xl font-black leading-[1.1] mb-6 tracking-tight transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    El Futuro del
                    <span className="block text-primary">Trabajo Penitenciario</span>
                    ha llegado.
                </h1>

                <p className={`text-base text-text-sub-light dark:text-text-sub-dark mb-10 leading-relaxed transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    La herramienta todo-en-uno diseñada por profesionales para profesionales. Controla tus turnos, libera tu tiempo y consulta a la IA en segundos.
                </p>

                {/* CTA Buttons */}
                <div className={`flex flex-col w-full gap-4 mb-20 transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative w-full bg-primary py-5 rounded-[2rem] overflow-hidden shadow-[0_20px_40px_-10px_rgba(13,89,242,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(13,89,242,0.5)] transition-all active:scale-95"
                    >
                        <div className="absolute inset-0 holographic-overlay opacity-30 group-hover:opacity-50"></div>
                        <span className="relative flex items-center justify-center gap-3 font-black text-white uppercase tracking-widest">
                            Empieza Ahora
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </span>
                    </button>

                    <button className="w-full py-4 text-xs font-bold uppercase tracking-widest text-[#111318] dark:text-white opacity-60 hover:opacity-100 transition-opacity">
                        Descubrir Funciones
                    </button>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-1 gap-6 w-full mb-12">
                    {features.map((f, idx) => (
                        <div
                            key={f.title}
                            className={`group flex items-center gap-5 p-5 bg-white dark:bg-surface-dark rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-soft transition-all duration-1000 hover:scale-[1.02] ${isVisible ? 'translate-x-0 opacity-100' : idx % 2 === 0 ? '-translate-x-10' : 'translate-x-10'} opacity-0`}
                            style={{ transitionDelay: `${1100 + idx * 200}ms` }}
                        >
                            <div className={`${f.color} size-14 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-sm uppercase tracking-tight mb-1">{f.title}</h3>
                                <p className="text-xs text-text-sub-light dark:text-text-sub-dark leading-snug">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Stats */}
                <div className={`mt-10 flex items-center justify-center gap-8 border-t border-gray-200 dark:border-gray-800 pt-10 w-full transition-all duration-1000 delay-[1800ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div>
                        <p className="text-2xl font-black text-primary">2k+</p>
                        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-tighter">Usuarios</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
                    <div>
                        <p className="text-2xl font-black text-primary">100%</p>
                        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-tighter">Oficial CSIF</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
                    <div>
                        <p className="text-2xl font-black text-primary">24/7</p>
                        <p className="text-[10px] font-bold uppercase text-gray-400 tracking-tighter">Soporte IA</p>
                    </div>
                </div>
            </main>

            {/* Footer Decoration */}
            <footer className="py-10 text-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">
                    © {new Date().getFullYear()} CSIF PRISIONES
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
