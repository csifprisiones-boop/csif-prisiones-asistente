import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased pb-24 h-full min-h-screen">
      <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b dark:border-border-dark border-border-light/50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
        <div className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer">
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Formación CSIF</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 text-primary hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[24px]">cloud_download</span>
          </button>
        </div>
      </div>
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-center bg-no-repeat bg-cover rounded-full h-16 w-16 border-2 border-primary" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCv56yznIscK-XldX8Drl5Gxs53DFipmnoFCPXEjLlUG9c4WpOVVjIDAFSJ8V8_0eo-3bdYkkAcuHgkpIb_TogjCnveVisJHSDAQqKQrN5Yeutkm3XUKDFwvQUWy8yuPmKctOtJ71ph4GWNqsiAv3UDm-7sLvWBeXzJQtQqW3OsIwt2UORJpVwXrEVSKsapROFI0zA5H_WFLFIfJjgNmenauPwo8dFBKOzAdz8KgEOL9iwQ_y1bPrrGdFQUzhZ_AlraVnfrTuA3zPYL")'}}></div>
          <div className="flex flex-col justify-center">
            <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight">Oficial García</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">Nivel 3</span>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Unidad de Seguridad</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1 rounded-xl p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex items-center gap-2 text-primary mb-1">
              <span className="material-symbols-outlined text-[20px]">school</span>
              <p className="text-sm font-medium leading-normal">En Progreso</p>
            </div>
            <p className="text-slate-900 dark:text-white tracking-tight text-2xl font-bold leading-tight">2</p>
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-xl p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              <p className="text-sm font-medium leading-normal">Horas Totales</p>
            </div>
            <p className="text-slate-900 dark:text-white tracking-tight text-2xl font-bold leading-tight">14</p>
          </div>
        </div>
      </div>
      {/* Featured */}
      <div className="pt-2 px-4">
        <div className="relative w-full rounded-2xl overflow-hidden aspect-[16/9] shadow-lg group cursor-pointer">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCLFfPyqWUoUq4Crw0sXAkK-sygTJJcKexH0AotIvN8A9Th7BfOAIEdfqpTmFxywnIc-buoCQAlkIbbieEinx5gsHBmfFhYS4yTW8_wqDkXRHnyUNv4AU6912g1v0kdmpBLay_KAy4_JxxBR4vzDO9H0x7DojI__p0ikJqW-hNxpMJfcXPlEKxpzDmcqlZj5dD7b7r_UkDLzfg_jLdZPVTwTqPWCzGPO95E1jKEYjQhRVHTEiXF2Babh4IK3VVHK0__LDPTOdPewke6")'}}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-5 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded text-xs font-bold bg-primary text-white uppercase tracking-wider">Nuevo</span>
              <span className="text-gray-300 text-xs font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">timer</span> 4h 30m
              </span>
            </div>
            <h3 className="text-white text-xl font-bold leading-snug mb-1">Manejo de Estrés en Crisis</h3>
            <button className="bg-white text-slate-900 hover:bg-gray-100 font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors mt-2">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Comenzar Curso
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default TrainingPage;