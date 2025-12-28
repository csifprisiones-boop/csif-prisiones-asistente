import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../services/supabase';
import csifLogo from '../csif-logo-3d.png';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSeniorityInfo = (createdAt: string) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const years = diffTime / (1000 * 60 * 60 * 24 * 365);

    // DEMO OVERRIDE: Descomenta esto para probar los diseños sin esperar años
    // const years = 7.5; 

    if (years >= 7) return {
      level: 'premium',
      cardGradient: 'bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37]',
      overlay: 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-20',
      textColor: 'text-[#5c4015]',
      labelColor: 'text-[#5c4015]/70',
      badgeIcon: 'workspace_premium',
      badgeClasses: 'bg-gradient-to-b from-yellow-300 to-yellow-600 text-white shadow-md border border-white/50',
      badgeText: 'PREMIUM',
      statusText: 'GOLD MEMBER'
    };
    if (years >= 5) return {
      level: 'platinum',
      cardGradient: 'bg-gradient-to-br from-[#E2E2E2] via-[#C9C9C9] to-[#8E8E8E]',
      overlay: '',
      textColor: 'text-slate-900',
      labelColor: 'text-slate-700',
      badgeIcon: 'stars',
      badgeClasses: 'bg-gradient-to-b from-slate-300 to-slate-500 text-white shadow-sm',
      badgeText: '+5 AÑOS',
      statusText: 'PLATITNUM'
    };
    if (years >= 4) return {
      level: 'silver',
      cardGradient: 'bg-gradient-to-br from-[#16a34a] to-[#14532d]',
      overlay: '',
      textColor: 'text-white',
      labelColor: 'text-white/70',
      badgeIcon: 'military_tech', // Silver style via color
      badgeClasses: 'bg-white/20 backdrop-blur-md text-gray-200 border border-white/30',
      badgeText: '+4 AÑOS',
      statusText: 'SILVER'
    };
    if (years >= 2) return {
      level: 'bronze',
      cardGradient: 'bg-gradient-to-br from-[#16a34a] to-[#14532d]',
      overlay: '',
      textColor: 'text-white',
      labelColor: 'text-white/70',
      badgeIcon: 'military_tech',
      badgeClasses: 'bg-white/20 backdrop-blur-md text-amber-500 border border-white/30',
      badgeText: years >= 2 ? '+2 AÑOS' : '+1 AÑO',
      statusText: 'BRONZE'
    };
    if (years >= 1) return {
      level: 'bronze',
      cardGradient: 'bg-gradient-to-br from-[#16a34a] to-[#14532d]',
      overlay: '',
      textColor: 'text-white',
      labelColor: 'text-white/70',
      badgeIcon: 'military_tech',
      badgeClasses: 'bg-white/20 backdrop-blur-md text-amber-600 border border-white/30',
      badgeText: '+1 AÑO',
      statusText: 'BRONZE'
    };

    return {
      level: 'new',
      cardGradient: 'bg-gradient-to-br from-[#16a34a] to-[#14532d]',
      overlay: '',
      textColor: 'text-white',
      labelColor: 'text-white/70',
      badgeIcon: 'verified',
      badgeClasses: 'bg-white/20 backdrop-blur-md text-white/90 border border-white/30',
      badgeText: 'ACTIVO',
      statusText: 'AFILIADO'
    };
  };

  const seniority = profile?.created_at ? getSeniorityInfo(profile.created_at) : getSeniorityInfo(new Date().toISOString());

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark pb-20">
      <header className="flex items-center px-4 pt-6 pb-2 justify-between sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">Perfil y Servicios</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center justify-center rounded-full w-10 h-10 bg-slate-200 dark:bg-card-dark text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>settings</span>
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col gap-6 px-4 py-2">
        {/* Dynamic Card */}
        <section className={`relative w-full aspect-[1.586] rounded-xl overflow-hidden shadow-2xl group select-none transition-all duration-500 hover:scale-[1.01] hover:shadow-primary/20`}>
          <div className={`absolute inset-0 ${seniority.cardGradient} p-5 flex flex-col justify-between transition-colors duration-500`}>
            {seniority.overlay && <div className={`absolute inset-0 ${seniority.overlay}`}></div>}

            <div className={`flex justify-between items-start z-10`}>
              <div className="flex flex-col gap-1">
                <div className={`text-xs font-bold tracking-wider opacity-90 ${seniority.textColor}`}>CSIF PRISIONES</div>
                <div className={`text-[10px] uppercase font-bold tracking-widest ${seniority.labelColor}`}>
                  {seniority.statusText}
                </div>
              </div>
              {/* CSIF Logo */}
              <div className={`w-36 h-28 flex items-center justify-center -mr-6 -mt-6 z-10`}>
                <img
                  src={csifLogo}
                  alt="CSIF Logo"
                  className={`max-w-full max-h-full object-contain ${seniority.level === 'premium' ? 'brightness-110' : ''}`}
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            </div>

            <div className="flex items-end justify-between mt-auto pt-2 z-10">
              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${seniority.labelColor}`}>Titular</p>
                <p className={`text-[18px] font-bold tracking-tight uppercase font-mono ${seniority.textColor} drop-shadow-sm leading-tight mb-1 break-words line-clamp-2`}>
                  {profile?.full_name || 'Cargando...'}
                </p>
                <p className={`text-sm font-medium tracking-widest font-mono opacity-80 ${seniority.textColor}`}>
                  {profile?.dni_fragment || '---'}
                </p>
              </div>

              {/* Insignia / Badge restored to right side */}
              <div className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl min-w-[64px] ${seniority.badgeClasses} shadow-lg transition-all flex-shrink-0`}>
                <span className={`material-symbols-outlined ${seniority.level === 'silver' ? 'text-gray-300' : ''}`} style={{ fontSize: '32px' }}>
                  {seniority.badgeIcon}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-tight whitespace-nowrap">
                  {seniority.badgeText}
                </span>
              </div>
            </div>

            {/* Shine effect for premium cards */}
            {seniority.level === 'premium' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
            )}
            {seniority.level === 'new' && (
              <div className="absolute inset-0 holographic-overlay pointer-events-none rounded-xl opacity-30"></div>
            )}
          </div>
        </section>
        <section className="grid grid-cols-3 gap-y-6 gap-x-3 mt-2">
          {/* Main Services */}
          <button onClick={() => window.open('https://www.csif.es/landing/as/', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">loyalty</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Club CSIF</span>
          </button>

          <button onClick={() => window.open('https://www.csif.es/es/articulo/nacional/general/38859', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">help_center</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">CSIF Ayuda</span>
          </button>

          <button onClick={() => window.open('https://www.ferreresysole.es/csif-seguros', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">health_and_safety</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Seguros</span>
          </button>

          <button onClick={() => window.open('https://www.csif.es/es/articulo/nacional/administraciongeneraldelestado/46612', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Calendarios</span>
          </button>

          <button onClick={() => window.open('https://muface.es/', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 dark:bg-sky-900/20 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Muface</span>
          </button>

          <button onClick={() => window.open('https://www.csif.es/es/portada/nacionalinstitucionespenitenciarias/categoria/concursosymovilidad', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">move_up</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Concursos</span>
          </button>

          <button onClick={() => window.open('https://www.csif.es/es/portada/nacionalinstitucionespenitenciarias/categoria/formacion', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">school</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Formación</span>
          </button>

          <button onClick={() => window.open('https://www.csif.es/es/portada/nacionalinstitucionespenitenciarias/categoria/negociacionesyacuerdos', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-500/10 dark:bg-slate-900/20 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-slate-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">handshake</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Negociación</span>
          </button>

          <button onClick={() => window.open('https://www.csif.es/es/portada/nacionalinstitucionespenitenciarias/categoria/prevencionderiesgoslaborales', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">engineering</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">PRL</span>
          </button>

          <button onClick={() => window.open('https://www.csif.es/es/portada/nacionalinstitucionespenitenciarias/categoria/puestodetrabajoycategoriaprofesional', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">work</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Puestos</span>
          </button>

          <button onClick={() => window.open('https://www.institucionpenitenciaria.es/es/web/home/inicio', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-500/10 dark:bg-slate-900/20 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-slate-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">apartment</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">SGIIPP</span>
          </button>

          <button onClick={() => window.open('https://www.interior.gob.es/opencms/es/inicio/', '_blank')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined">assured_workload</span>
            </div>
            <span className="text-[10px] font-bold text-center text-slate-600 dark:text-slate-400 uppercase tracking-tight">Ministerio</span>
          </button>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;