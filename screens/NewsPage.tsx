import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 z-20 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCHG1RS1qmspq71CopJH7iYj3EwkUn0H0DXvONtf4onZ9z7RcIr7xO-MehM6SkdonTzTRiYCCmXuurNtsLJbTlfcnY6g7o01YbFWt6iKfKAn2JQM9hUF7JJF7Y1zd0VWO49gYQoQomhybNfO3BtuwrBBej6vQwFjOMO4wJpWLaU8s1d_hRJzkZRebGwwFskeY1jSRh-GqvAT870vVijczkeVOnyS5uMicxNh-dHz0y9M6iIrZQHOAFOvd87MJkyx69lSLBgsNR3_WPi")'}}></div>
            <div className="absolute bottom-0 right-0 size-3 bg-csif-green rounded-full border-2 border-background-dark"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">CSIF Prisiones</span>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button className="flex items-center justify-center rounded-full size-10 bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-white transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>
      </div>
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Hola, Carlos 👋</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Aquí tienes las novedades de hoy.</p>
      </div>
      <div className="flex gap-3 px-4 py-4 overflow-x-auto no-scrollbar w-full">
         <button onClick={() => navigate('/shifts')} className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 pl-3 pr-4 shadow-sm active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
            <p className="text-sm font-medium leading-normal dark:text-white">Turnos</p>
        </button>
         <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 pl-3 pr-4 shadow-sm active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            <p className="text-sm font-medium leading-normal dark:text-white">Nómina</p>
        </button>
         <button onClick={() => navigate('/profile')} className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 pl-3 pr-4 shadow-sm active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-rose-500 text-[20px]">psychology</span>
            <p className="text-sm font-medium leading-normal dark:text-white">Ayuda Psicológica</p>
        </button>
      </div>
      <div className="flex items-center justify-between px-4 pt-2 pb-2">
        <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Últimas Noticias</h3>
        <button className="text-primary text-sm font-medium hover:underline">Ver todo</button>
      </div>
      <div className="flex flex-col gap-4 px-4 pb-4">
        <article className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-card-light dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 bg-center bg-cover rounded-lg" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDaognCEzMXv8BhaLIrVAVc-iqgfL_-iKi8kSCzM1Bi88yCbP5Yp1Jtw29MxFQqFEwneHzqr1kOSui-R1tmtqYtQUSaqFQXLw22GXb6wcIWMuRp3dKnGFY0hrhD-oRdpjdlEvM7bNLlb-9FuDDRRRM1rsMdtslhPsDyJ3usrZybgKo0xgVmAzwyKbps5sz2c2urtApXJtbuRA1UibmNsebKDs2OrTi4F9SBJkkrxrr3Ya_bLDqgX8F7UaJjthBjhfjoLJfx-cljn3go")'}}></div>
          <div className="flex flex-col justify-between grow py-1">
            <div className="flex flex-col gap-1">
              <span className="w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Laboral</span>
              <h4 className="text-base font-bold leading-snug line-clamp-2 dark:text-white">Subida salarial confirmada para el 2024: Consulta las tablas</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">El acuerdo firmado por CSIF garantiza un aumento del 3.5% en todos los complementos.</p>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>Hace 2 horas</span>
            </div>
          </div>
        </article>
         <article className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-card-light dark:bg-card-dark shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 bg-center bg-cover rounded-lg" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAVPk7Q2vXSsc227mmDwYRlFumrinkmsUNYTDKk_D3XelwH7_ro7j04DPW4g69C_zLTIWtbAexIn5NuOhOBnTVUoxLmq_vHjJTIr6X9N9dlOFYbZ7qfHWVFcbtB7uQl6VL3o4yWeV1DQZQqHUc4TxaGsZpCQKra2X__8UnLy0-qRSaFIS1dHZNdmVCSTkF_MaqodRorn0QuOk59tyQuQTYBj2bUme0V_GwkasnsHUgD0k7VPcVOyH2V-ceVeTXHFhkbDX5_WH1kMDoz")'}}></div>
          <div className="flex flex-col justify-between grow py-1">
            <div className="flex flex-col gap-1">
              <span className="w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Bienestar</span>
              <h4 className="text-base font-bold leading-snug line-clamp-2 dark:text-white">Taller de gestión del estrés en entornos penitenciarios</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">Nuevas plazas disponibles para el curso online de apoyo psicológico.</p>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>Hace 5 horas</span>
            </div>
          </div>
        </article>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default NewsPage;