import React from 'react';
import { useNavigate } from 'react-router-dom';

const AlertPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl">
      <div className="sticky top-0 z-50 flex items-center bg-surface-light dark:bg-surface-dark px-4 py-3 justify-between shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div onClick={() => navigate('/')} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <img alt="CSIF Logo" className="w-8 h-8 rounded object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACqO-yfqIoSbR5_pIn7MClkpHAPj5G0rCdXhik4dMDjRU3JMzWXUZuzO9nCz-ZmWN7VfrPheCSoUJAEljxiJAPtkIAkThf5PiVxhKfoap1WdexKwB0QXWxL4aukEsDEUbp3uCT691lGv0vVWUJVmZEzL_jpnCP66NTUff3lT1p5HvL8fTUHqOYIm8imkC3XcCDcfXhxv1iqIM5Q6Id8qnEUgdaTKXLL3AKpJBK0dFWgyDxtJDNuz9EuzC9mDeOrKARkSYnJM2jqmeu"/>
        </div>
        <h2 className="text-text-main-light dark:text-text-main-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center">Estado de Alerta</h2>
        <button onClick={() => navigate('/')} className="flex items-center justify-end px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors">
          <span className="text-red-600 dark:text-red-400 text-sm font-bold leading-normal tracking-wide shrink-0">Cancelar</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-6 pb-24">
        <div className="flex flex-col items-center justify-center py-8 gap-6 animate-fade-in">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full animate-ping opacity-75"></div>
            <div className="relative flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full text-success dark:text-green-400">
              <span className="material-symbols-outlined text-[48px]">verified_user</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 max-w-[320px] text-center">
            <h1 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark leading-tight">Reporte Enviado</h1>
            <p className="text-text-sub-light dark:text-text-sub-dark text-base font-normal leading-relaxed">El protocolo de seguridad ha sido activado. Tu ubicación ha sido compartida con el centro de control.</p>
          </div>
          <button className="w-full max-w-[320px] flex items-center justify-center gap-2 h-12 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            <span className="text-sm font-bold tracking-wide">Añadir fotos o notas de voz</span>
          </button>
        </div>
        
        <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>
        
        <div className="flex flex-col gap-4">
          <div className="px-1">
            <h3 className="text-text-main-light dark:text-text-main-dark text-lg font-bold">¿Necesitas ayuda adicional?</h3>
            <p className="text-text-sub-light dark:text-text-sub-dark text-sm mt-1">Recursos de soporte disponibles 24/7</p>
          </div>
          {/* Items */}
          <div className="group flex items-center gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft cursor-pointer hover:border-primary/50 transition-all">
            <div className="flex items-center justify-center shrink-0 size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-primary">
              <span className="material-symbols-outlined text-[24px]">gavel</span>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <p className="text-text-main-light dark:text-text-main-dark text-base font-bold truncate">Soporte Jurídico</p>
              <p className="text-text-sub-light dark:text-text-sub-dark text-sm truncate">Asesoramiento legal inmediato</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
          </div>
          <div className="group flex items-center gap-4 p-4 bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft cursor-pointer hover:border-primary/50 transition-all">
            <div className="flex items-center justify-center shrink-0 size-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <p className="text-text-main-light dark:text-text-main-dark text-base font-bold truncate">Recursos Psicológicos</p>
              <p className="text-text-sub-light dark:text-text-sub-dark text-sm truncate">Apoyo emocional y bienestar</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPage;