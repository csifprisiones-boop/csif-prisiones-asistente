import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../components/AuthProvider';

const COMMUNITY_EMAILS: Record<string, string> = {
  'Andalucía': 'prisiones28@csif.es',
  'Aragón': 'prisiones28@csif.es',
  'Principado de Asturias': 'prisiones28@csif.es',
  'Islas Baleares': 'prisiones28@csif.es',
  'Canarias': 'prisiones28@csif.es',
  'Cantabria': 'prisiones28@csif.es',
  'Castilla-La Mancha': 'prisiones28@csif.es',
  'Castilla y León': 'prisiones28@csif.es',
  'Cataluña': 'prisiones28@csif.es',
  'Comunidad Valenciana': 'prisiones28@csif.es',
  'Extremadura': 'prisiones28@csif.es',
  'Galicia': 'prisiones28@csif.es',
  'La Rioja': 'prisiones28@csif.es',
  'Comunidad de Madrid': 'prisiones28@csif.es',
  'Región de Murcia': 'prisiones28@csif.es',
  'Comunidad Foral de Navarra': 'prisiones28@csif.es',
  'País Vasco': 'prisiones28@csif.es',
  'Ciudad Autónoma de Ceuta': 'prisiones28@csif.es',
  'Ciudad Autónoma de Melilla': 'prisiones28@csif.es'
};

const ALERT_OPTIONS = [
  { id: 'juridico', label: 'Soporte Jurídico', icon: 'gavel', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'psicologico', label: 'Recursos Psicológicos', icon: 'volunteer_activism', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'delegado', label: 'Contactar con Delegado', icon: 'person_search', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
];

const AlertPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    if (data) setProfile(data);
  };

  const toggleOption = (id: string) => {
    const newOptions = new Set(selectedOptions);
    if (newOptions.has(id)) {
      newOptions.delete(id);
    } else {
      newOptions.add(id);
    }
    setSelectedOptions(newOptions);
  };

  const handleConfirmSend = () => {
    if (!profile) return;
    setIsSending(true);

    const email = COMMUNITY_EMAILS[profile.community] || 'prisiones28@csif.es';
    const selectedLabels = ALERT_OPTIONS
      .filter(opt => selectedOptions.has(opt.id))
      .map(opt => opt.label)
      .join(', ');

    const subject = `ALERTA APP ASISTENTE: ${profile.full_name}`;
    const body = `Como Responsable Autonómico de CSIF, te envío esta "ALERTA" de la APP Asistente CSIF PRISIONES en la que el afiliado ${profile.full_name}, que trabaja en ${profile.workspace}, En el puesto de ${profile.position}, y con Nº de Teléfono ${profile.phone || 'No aportado'} solicita que le contactéis por los siguientes motivos: ${selectedLabels || 'Ninguna opción específica marcada'}.${description ? `\n\nDescripción de la prestación: ${description}` : ''}`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open mail app
    window.location.href = mailtoUrl;

    // Show success feedback
    setTimeout(() => {
      setIsSending(false);
      setShowSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-6 animate-scale-in">
          <div className="size-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-[64px] filled">check_circle</span>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-2 text-text-main-light dark:text-text-main-dark">¡Reporte Enviado!</h2>
            <p className="text-text-sub-light dark:text-text-sub-dark">Tu alerta se ha procesado correctamente. Volviendo al inicio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 py-3 justify-between shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div onClick={() => navigate('/home')} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <img alt="CSIF Logo" className="w-8 h-8 rounded object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACqO-yfqIoSbR5_pIn7MClkpHAPj5G0rCdXhik4dMDjRU3JMzWXUZuzO9nCz-ZmWN7VfrPheCSoUJAEljxiJAPtkIAkThf5PiVxhKfoap1WdexKwB0QXWxL4aukEsDEUbp3uCT691lGv0vVWUJVmZEzL_jpnCP66NTUff3lT1p5HvL8fTUHqOYIm8imkC3XcCDcfXhxv1iqIM5Q6Id8qnEUgdaTKXLL3AKpJBK0dFWgyDxtJDNuz9EuzC9mDeOrKARkSYnJM2jqmeu" />
        </div>
        <h2 className="text-text-main-light dark:text-text-main-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center">Reporte de Envío</h2>
        <button onClick={() => navigate('/home')} className="flex items-center justify-end px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors">
          <span className="text-red-600 dark:text-red-400 text-sm font-bold leading-normal tracking-wide shrink-0">Cancelar</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-6 pb-32">
        <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-6 animate-fade-in text-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-ping opacity-75"></div>
            <div className="relative flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-[52px] filled">e911_emergency</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 px-2">
            <h1 className="text-2xl font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">Protocolo Activado</h1>
            <p className="text-text-sub-light dark:text-text-sub-dark text-sm leading-relaxed font-medium">
              El protocolo de seguridad ha sido activado. Tus datos para la prestación del servicio se enviarán al Responsable Autonómico de CSIF II.PP. y si confirmas la ALERTA se pondrán en contacto contigo lo antes posible.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>

        <div className="flex flex-col gap-5">
          <div className="px-1 items-center flex justify-between">
            <div>
              <h3 className="text-text-main-light dark:text-text-main-dark text-sm font-black uppercase tracking-widest text-primary">Motivos del Reporte</h3>
              <p className="text-text-sub-light dark:text-text-sub-dark text-[10px] mt-0.5 font-bold uppercase opacity-60">Selecciona las opciones necesarias</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {ALERT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                className={`group flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 ${selectedOptions.has(opt.id)
                    ? 'bg-primary/10 border-primary shadow-[0_8px_20px_-8px_rgba(0,150,64,0.3)] scale-[1.01]'
                    : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 shadow-soft'
                  }`}
              >
                <div className={`flex items-center justify-center shrink-0 size-14 rounded-2xl transition-all duration-500 ${selectedOptions.has(opt.id) ? 'bg-primary text-white scale-110' : `${opt.bg} ${opt.color}`
                  }`}>
                  <span className={`material-symbols-outlined text-[28px] ${selectedOptions.has(opt.id) ? 'filled' : ''}`}>{opt.icon}</span>
                </div>
                <div className="flex flex-col flex-1 text-left">
                  <p className={`text-base font-black transition-colors ${selectedOptions.has(opt.id) ? 'text-primary' : 'text-text-main-light dark:text-text-main-dark'
                    }`}>
                    {opt.label}
                  </p>
                </div>
                <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOptions.has(opt.id) ? 'bg-primary border-primary scale-110' : 'border-gray-200 dark:border-gray-700'
                  }`}>
                  {selectedOptions.has(opt.id) && <span className="material-symbols-outlined text-white text-[16px] font-black">check</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Additional Description */}
          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
              <label className="text-text-main-light dark:text-text-main-dark text-xs font-black uppercase tracking-widest">
                Descripción de la prestación
              </label>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe aquí los detalles de la ayuda o el motivo del reporte..."
              className="w-full h-40 p-5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm resize-none dark:text-white shadow-soft transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Floating Confirmation Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent max-w-md mx-auto z-50">
        <button
          onClick={handleConfirmSend}
          disabled={isSending || (selectedOptions.size === 0 && !description)}
          className={`w-full py-5 rounded-3xl font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm ${(selectedOptions.size === 0 && !description)
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30'
            }`}
        >
          {isSending ? (
            <div className="size-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined font-black">send_and_archive</span>
              Confirmar Envío de Alerta
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AlertPage;