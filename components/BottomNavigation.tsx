import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full max-w-md mx-auto items-center justify-around bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button
        onClick={() => navigate('/home')}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/home') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
      >
        <span className={`material-symbols-outlined text-[24px] ${isActive('/home') ? 'filled' : ''}`}>home</span>
        <span className="text-[10px] font-medium">Inicio</span>
      </button>
      <button
        onClick={() => navigate('/shifts')}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/shifts') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
      >
        <span className={`material-symbols-outlined text-[24px] ${isActive('/shifts') ? 'filled' : ''}`}>calendar_month</span>
        <span className="text-[10px] font-medium">Turnos</span>
      </button>
      <button
        onClick={() => navigate('/chat')}
        className="flex flex-col items-center justify-center -mt-6 group"
      >
        <div className={`size-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isActive('/chat') ? 'bg-primary text-white shadow-primary/40 scale-105' : 'bg-primary text-white shadow-primary/40 hover:scale-105'}`}>
          <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
        </div>
      </button>
      <button
        onClick={() => navigate('/documents')}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/documents') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
      >
        <span className={`material-symbols-outlined text-[24px] ${isActive('/documents') ? 'filled' : ''}`}>description</span>
        <span className="text-[10px] font-medium">Docs</span>
      </button>
      <button
        onClick={() => navigate('/profile')}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('/profile') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
      >
        <span className={`material-symbols-outlined text-[24px] ${isActive('/profile') ? 'filled' : ''}`}>person</span>
        <span className="text-[10px] font-medium">Perfil</span>
      </button>
    </div>
  );
};

export default BottomNavigation;