import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { supabase } from '../services/supabase';
import { ShiftRecord, ShiftExchange, ShiftType, OccasionType, LeaveType } from '../types';
import { useAuth } from '../components/AuthProvider';

const SHIFT_TYPES: { type: ShiftType; label: string; color: string }[] = [
  { type: 'M', label: 'Mañana', color: 'bg-green-500' },
  { type: 'T', label: 'Tarde', color: 'bg-yellow-500' },
  { type: 'N', label: 'Noche', color: 'bg-red-500' },
  { type: 'M/T', label: 'Mañana/Tarde', color: 'bg-orange-500' },
  { type: 'M/N', label: 'Mañana/Noche', color: 'bg-purple-500' },
  { type: 'GL', label: 'G. Localizada', color: 'bg-blue-400' },
  { type: 'GF', label: 'G. Física', color: 'bg-blue-600' },
  { type: 'L', label: 'Libre', color: 'bg-gray-400' },
];

const OCCASIONS: { type: OccasionType; label: string; icon: string; color: string }[] = [
  { type: 'birthday', label: 'Cumpleaños', icon: 'cake', color: 'text-pink-500' },
  { type: 'meeting', label: 'Reunión', icon: 'groups', color: 'text-blue-500' },
  { type: 'medical', label: 'Médico', icon: 'medical_services', color: 'text-red-500' },
  { type: 'workshop', label: 'Taller', icon: 'build', color: 'text-orange-500' },
  { type: 'party', label: 'Fiesta', icon: 'celebration', color: 'text-purple-500' },
  { type: 'sport', label: 'Deporte', icon: 'sports_soccer', color: 'text-green-500' },
  { type: 'shopping', label: 'Compras', icon: 'shopping_cart', color: 'text-amber-500' }
];

const LEAVE_TYPES: { type: LeaveType; label: string; icon: string; color: string }[] = [
  { type: 'vacation', label: 'Vacaciones', icon: 'flight_takeoff', color: 'text-emerald-500' },
  { type: 'seniority', label: 'AP Antigüedad', icon: 'history', color: 'text-amber-600' },
  { type: 'owed', label: 'Días Debidos', icon: 'account_balance_wallet', color: 'text-purple-600' },
];

const ShiftsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'calendar' | 'market'>('calendar');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [shifts, setShifts] = useState<Record<string, ShiftRecord>>({});
  const [showShiftSelector, setShowShiftSelector] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Market State
  const [exchanges, setExchanges] = useState<ShiftExchange[]>([]);
  const [showCreateExchange, setShowCreateExchange] = useState(false);
  const [exchangeDescription, setExchangeDescription] = useState('');
  const [filterWorkspace, setFilterWorkspace] = useState<string>('all');

  // Paint Mode State
  const [activePaintShift, setActivePaintShift] = useState<ShiftType | 'eraser' | null>(null);
  const [activePaintOccasion, setActivePaintOccasion] = useState<OccasionType | 'eraser' | null>(null);
  const [activePaintLeave, setActivePaintLeave] = useState<LeaveType | 'eraser' | null>(null);

  const [userProfile, setUserProfile] = useState<{
    workspace?: string;
    position?: string;
    community?: string;
    role?: string;
    vacation_days_limit?: number;
    seniority_days_limit?: number;
    owed_days_limit?: number;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [manualRoleOverride, setManualRoleOverride] = useState<'interior' | 'sanitario' | null>(null);

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'delete' | 'accept' | 'success' | 'error';
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'delete'
  });

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('workspace, position, role, community, vacation_days_limit, seniority_days_limit, owed_days_limit').eq('id', user.id).single()
        .then(({ data }) => {
          setUserProfile(data);
          if (data?.role === 'admin') setIsAdmin(true);
        });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchShifts();
      fetchExchanges();
    }
  }, [user, currentDate, viewMode]); // Refetch when month/mode changes

  const getHolidaysForYear = (year: number, userRegion: string): Record<string, string> => {
    const holidays2026: Record<string, { name: string; region?: string }> = {
      '1-1': { name: 'Año Nuevo' },
      '1-6': { name: 'Epifanía del Señor' },
      '2-28': { name: 'Día de Andalucía', region: 'Andalucía' },
      '3-2': { name: 'Día de las Illes Balears', region: 'Baleares' },
      '3-19': { name: 'San José', region: 'San José' },
      '3-20': { name: 'Estatuto de Autonomía / Eid Fitr', region: 'Melilla' },
      '4-2': { name: 'Jueves Santo', region: 'Jueves Santo' },
      '4-3': { name: 'Viernes Santo' },
      '4-6': { name: 'Lunes de Pascua', region: 'Lunes de Pascua' },
      '4-23': { name: 'Día de Aragón / CyL', region: 'Aragón/Castilla y León' },
      '5-1': { name: 'Fiesta del Trabajo' },
      '5-2': { name: 'Fiesta de la Comunidad de Madrid', region: 'Madrid' },
      '5-27': { name: 'Fiesta del Sacrificio (Aid El Adha)', region: 'Ceuta/Melilla' },
      '5-30': { name: 'Día de Canarias', region: 'Canarias' },
      '6-4': { name: 'Corpus Christi', region: 'Castilla-La Mancha' },
      '6-9': { name: 'Día de Murcia / La Rioja', region: 'Murcia/Rioja' },
      '6-24': { name: 'San Juan', region: 'San Juan' },
      '7-25': { name: 'Santiago Apóstol', region: 'Santiago' },
      '7-28': { name: 'Día de las Instituciones', region: 'Cantabria' },
      '8-5': { name: 'Nuestra Sra. de África', region: 'Ceuta' },
      '8-15': { name: 'Asunción de la Virgen' },
      '9-2': { name: 'Día de Ceuta', region: 'Ceuta' },
      '9-8': { name: 'Día de Asturias / Extremadura', region: 'Asturias/Extremadura' },
      '9-11': { name: 'Festa de la Diada', region: 'Catalunya' },
      '9-15': { name: 'La Bien Aparecida', region: 'Cantabria' },
      '10-9': { name: 'Día de la C. Valenciana', region: 'Valenciana' },
      '10-12': { name: 'Fiesta Nacional de España' },
      '11-2': { name: 'Todos los Santos (Traslado)', region: 'Traslado1Nov' },
      '12-7': { name: 'Día de la Constitución (Traslado)', region: 'Traslado6Dic' },
      '12-8': { name: 'La Inmaculada Concepción' },
      '12-25': { name: 'Natividad del Señor' },
      '12-26': { name: 'San Esteban / Sant Esteve', region: 'Catalunya/Baleares' }
    };

    const holidays2025: Record<string, { name: string; region?: string }> = {
      '1-1': { name: 'Año Nuevo' },
      '1-6': { name: 'Día de Reyes' },
      '2-2': { name: 'Candelaria', region: 'Tenerife' },
      '2-28': { name: 'Día de Andalucía', region: 'Andalucía' },
      '3-1': { name: 'Día de Baleares', region: 'Baleares' },
      '3-2': { name: 'Carnaval', region: 'Locales' },
      '3-19': { name: 'San José', region: 'San José' },
      '4-13': { name: 'Semana Santa / D. Ramos' },
      '4-14': { name: 'Lunes Santo' },
      '4-15': { name: 'Martes Santo' },
      '4-16': { name: 'Miércoles Santo' },
      '4-17': { name: 'Jueves Santo', region: 'Jueves Santo' },
      '4-18': { name: 'Viernes Santo' },
      '4-19': { name: 'Sábado Santo' },
      '4-20': { name: 'D. Resurrección / Pascua' },
      '4-21': { name: 'Lunes de Pascua', region: 'Lunes de Pascua' },
      '4-23': { name: 'Día de Aragón / San Jorge', region: 'Aragón' },
      '5-1': { name: 'Fiesta del Trabajo' },
      '5-2': { name: 'Fiesta Comunidad (Madrid)', region: 'Madrid' },
      '5-15': { name: 'San Isidro (Sólo Madrid)', region: 'Madrid' },
      '6-9': { name: 'Lunes de Pentecostés', region: 'Catalunya' },
      '6-19': { name: 'Corpus Christi', region: 'Castilla-La Mancha/Madrid' },
      '7-25': { name: 'Santiago Apóstol', region: 'Santiago' },
      '8-10': { name: 'Día de Cantabria', region: 'Cantabria' },
      '8-15': { name: 'Asunción de la Virgen' },
      '10-12': { name: 'Fiesta Nacional de España' },
      '11-1': { name: 'Todos los Santos' },
      '11-9': { name: 'Almudena (Sólo Madrid)', region: 'Madrid' },
      '12-6': { name: 'Día de la Constitución' },
      '12-8': { name: 'La Inmaculada Concepción' },
      '12-25': { name: 'Natividad del Señor' }
    };

    const targetHolidays = year === 2026 ? holidays2026 : holidays2025;
    const filtered: Record<string, string> = {};

    Object.entries(targetHolidays).forEach(([date, data]) => {
      if (!data.region) {
        filtered[date] = data.name; // National
      } else {
        const userReg = userRegion.toLowerCase();
        const holiReg = data.region.toLowerCase();
        const matches = (keyword: string) => userReg.includes(keyword.toLowerCase()) && holiReg.includes(keyword.toLowerCase());

        if (matches('madrid')) filtered[date] = data.name;
        else if (matches('andalucía')) filtered[date] = data.name;
        else if (matches('aragón')) filtered[date] = data.name;
        else if (userReg.includes('baleares') || userReg.includes('balears')) {
          if (holiReg.includes('baleares') || holiReg.includes('balears')) filtered[date] = data.name;
        }
        else if (matches('canarias')) filtered[date] = data.name;
        else if (matches('cantabria')) filtered[date] = data.name;
        else if (matches('castilla-la mancha')) filtered[date] = data.name;
        else if (userReg.includes('castilla y león') && holiReg.includes('león')) filtered[date] = data.name;
        else if ((userReg.includes('catalunya') || userReg.includes('cataluña')) && holiReg.includes('catalunya')) filtered[date] = data.name;
        else if (matches('valenciana')) filtered[date] = data.name;
        else if (matches('galicia')) filtered[date] = data.name;
        else if (matches('extremadura')) filtered[date] = data.name;
        else if (matches('murcia')) filtered[date] = data.name;
        else if (matches('asturias')) filtered[date] = data.name;
        else if (matches('rioja')) filtered[date] = data.name;
        else if (matches('navarra')) filtered[date] = data.name;
        else if (matches('vasco')) filtered[date] = data.name;
        else if (matches('ceuta')) filtered[date] = data.name;
        else if (matches('melilla')) filtered[date] = data.name;

        // Shared regional holidays logic
        if (holiReg === 'jueves santo') {
          const isCatVal = userReg.includes('catalunya') || userReg.includes('cataluña') || userReg.includes('valenciana');
          if (!isCatVal) filtered[date] = data.name;
        } else if (holiReg === 'lunes de pascua') {
          const isLunesPascuaReg = userReg.includes('catalunya') || userReg.includes('cataluña') ||
            userReg.includes('baleares') || userReg.includes('balears') ||
            userReg.includes('valenciana') || userReg.includes('navarra') ||
            userReg.includes('vasco') || userReg.includes('rioja') || userReg.includes('mancha');
          if (isLunesPascuaReg) filtered[date] = data.name;
        } else if (holiReg === 'san josé') {
          if (userReg.includes('murcia') || userReg.includes('valenciana') || userReg.includes('galicia') || userReg.includes('vasco') || userReg.includes('navarra')) filtered[date] = data.name;
        } else if (holiReg === 'santiago') {
          if (userReg.includes('galicia') || userReg.includes('vasco')) filtered[date] = data.name;
        } else if (holiReg === 'traslado1nov') {
          const isTraslado1Nov = ['andalucía', 'aragón', 'asturias', 'canarias', 'mancha', 'león', 'madrid', 'navarra'].some(r => userReg.includes(r));
          if (isTraslado1Nov) filtered[date] = data.name;
        } else if (holiReg === 'traslado6dic') {
          const isTraslado6Dic = ['andalucía', 'aragón', 'asturias', 'cantabria', 'león', 'extremadura', 'madrid', 'murcia', 'rioja', 'melilla'].some(r => userReg.includes(r));
          if (isTraslado6Dic) filtered[date] = data.name;
        } else if (holiReg === 'traslado' || holiReg.includes('traslado')) {
          filtered[date] = data.name;
        }
      }
    });

    return filtered;
  };

  // Helper for local date string YYYY-MM-DD
  const toLocalISODate = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
  };

  useEffect(() => {
    const checkAlarms = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const todayStr = toLocalISODate(now);
      const todayShift = shifts[todayStr];

      if (todayShift?.alarm_enabled && !todayShift.alarm_sent) {
        // Simple logic for IIPP shifts (hardcoded start times for alarm demo)
        const startTimes: Record<string, string> = {
          'M': '08:00',
          'T': '15:00',
          'N': '22:00',
          'M/T': '08:00',
          'M/N': '08:00'
        };

        const startTimeStr = startTimes[todayShift.shift_type];
        if (startTimeStr) {
          const [hours, mins] = startTimeStr.split(':').map(Number);
          const shiftStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
          const minutesUntilShift = (shiftStartTime.getTime() - now.getTime()) / 60000;

          if (minutesUntilShift > 0 && minutesUntilShift <= (todayShift.alarm_minutes_before || 60)) {
            new Notification('CSIF: Aviso de Turno', {
              body: `Tu turno de ${todayShift.shift_type} empieza pronto (${startTimeStr}).`,
              icon: '/logo192.png'
            });
            // Mark as sent in state to avoid duplicate alerts (ideally persist to DB too)
            setShifts(prev => ({
              ...prev,
              [todayStr]: { ...prev[todayStr], alarm_sent: true } as any
            }));
          }
        }
      }
    };

    const interval = setInterval(checkAlarms, 60000);
    return () => clearInterval(interval);
  }, [shifts]);

  const fetchShifts = async () => {
    if (!user) return;

    let query = supabase.from('shifts').select('*').eq('user_id', user.id);

    const year = currentDate.getFullYear();
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching shifts:', error);
      return;
    }

    const shiftMap: Record<string, ShiftRecord> = {};
    data?.forEach(shift => {
      shiftMap[shift.date] = shift;
    });
    setShifts(shiftMap);
  };

  const fetchExchanges = async () => {
    const { data, error } = await supabase
      .from('shift_exchanges')
      .select(`
        *,
        profiles!inner(full_name, workspace, position)
      `)
      .eq('status', 'open');

    if (error) {
      console.error('Error fetching exchanges:', error);
      // If it's a join error, try a simpler fetch as fallback
      const { data: simpleData } = await supabase.from('shift_exchanges').select('*').eq('status', 'open');
      setExchanges(simpleData || []);
    } else {
      const sorted = (data || []).sort((a, b) => {
        const profA = (a as any).profiles;
        const profB = (b as any).profiles;
        const workspaceA = profA?.workspace || '';
        const workspaceB = profB?.workspace || '';
        if (workspaceA !== workspaceB) return workspaceA.localeCompare(workspaceB, 'es');

        const positionA = profA?.position || '';
        const positionB = profB?.position || '';
        return positionA.localeCompare(positionB, 'es');
      });
      setExchanges(sorted);
    }
  };

  const handleSaveShift = async (type: ShiftType, dateToSave?: Date) => {
    if (!user) return;

    const dateStr = toLocalISODate(dateToSave || selectedDate);

    const { error } = await supabase
      .from('shifts')
      .upsert({
        user_id: user.id,
        date: dateStr,
        shift_type: type
      }, { onConflict: 'user_id,date' });

    if (error) {
      alert('Error al guardar el turno');
      console.error(error);
    } else {
      // Update local state immediately for responsiveness
      setShifts(prev => ({
        ...prev,
        [dateStr]: { id: 'temp', user_id: user.id, date: dateStr, shift_type: type }
      }));
      setShowShiftSelector(false);
    }
  };

  const handleSaveNote = async (noteText: string) => {
    if (!user || !selectedDate) return;
    setIsSavingNote(true);
    const dateStr = toLocalISODate(selectedDate);

    const { error } = await supabase
      .from('shifts')
      .upsert({
        user_id: user.id,
        date: dateStr,
        notes: noteText,
        shift_type: shifts[dateStr]?.shift_type || 'L'
      }, { onConflict: 'user_id,date' });

    if (error) {
      console.error(error);
      alert('Error al guardar la nota: ' + error.message);
    } else {
      setShifts(prev => ({
        ...prev,
        [dateStr]: { ...(prev[dateStr] || { id: 'temp', user_id: user.id, date: dateStr, shift_type: shifts[dateStr]?.shift_type || 'L' }), notes: noteText }
      }));
    }
    setIsSavingNote(false);
  };

  const handleDeleteShift = async (dateToDelete?: Date) => {
    if (!user) return;
    const dateStr = toLocalISODate(dateToDelete || selectedDate);
    const existing = shifts[dateStr];

    if (existing?.occasion) {
      // If there's an occasion, don't delete the row, just set shift to 'L' (Libre)
      const { error } = await supabase
        .from('shifts')
        .update({ shift_type: 'L' })
        .eq('user_id', user.id)
        .eq('date', dateStr);

      if (error) {
        alert('Error al resetear el turno');
      } else {
        setShifts(prev => ({
          ...prev,
          [dateStr]: { ...prev[dateStr], shift_type: 'L' }
        }));
      }
    } else {
      // No occasion, safe to delete the whole record
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('user_id', user.id)
        .eq('date', dateStr);

      if (error) {
        alert('Error al borrar el turno');
        console.error(error);
      } else {
        setShifts(prev => {
          const newShifts = { ...prev };
          delete newShifts[dateStr];
          return newShifts;
        });
        setShowShiftSelector(false);
      }
    }
  };

  const handleSaveOccasion = async (occasion: OccasionType, dateToSave?: Date) => {
    if (!user) return;
    const dateStr = toLocalISODate(dateToSave || selectedDate);

    const { error } = await supabase
      .from('shifts')
      .upsert({
        user_id: user.id,
        date: dateStr,
        occasion: occasion,
        shift_type: shifts[dateStr]?.shift_type || 'L'
      }, { onConflict: 'user_id,date' });

    if (error) {
      alert('Error al guardar la ocasión');
      console.error(error);
    } else {
      setShifts(prev => ({
        ...prev,
        [dateStr]: { ...(prev[dateStr] || { id: 'temp', user_id: user.id, date: dateStr, shift_type: 'L' }), occasion: occasion }
      }));
    }
  };

  const handleDeleteOccasion = async (dateToDelete?: Date) => {
    if (!user) return;
    const dateStr = toLocalISODate(dateToDelete || selectedDate);

    const { error } = await supabase
      .from('shifts')
      .upsert({
        user_id: user.id,
        date: dateStr,
        occasion: null,
        shift_type: shifts[dateStr]?.shift_type || 'L'
      }, { onConflict: 'user_id,date' });

    if (error) {
      alert('Error al borrar la ocasión');
      console.error(error);
    } else {
      setShifts(prev => {
        if (!prev[dateStr]) return prev;
        const updated = { ...prev[dateStr] };
        delete updated.occasion;
        return { ...prev, [dateStr]: updated };
      });
    }
  };

  const handleSaveLeave = async (leaveType: LeaveType, dateToSave?: Date) => {
    if (!user) return;
    const dateStr = toLocalISODate(dateToSave || selectedDate);

    const { error } = await supabase
      .from('shifts')
      .upsert({
        user_id: user.id,
        date: dateStr,
        leave_type: leaveType,
        shift_type: shifts[dateStr]?.shift_type || 'L'
      }, { onConflict: 'user_id,date' });

    if (error) {
      alert('Error al guardar el permiso');
      console.error(error);
    } else {
      setShifts(prev => ({
        ...prev,
        [dateStr]: { ...(prev[dateStr] || { id: 'temp', user_id: user.id, date: dateStr, shift_type: 'L' }), leave_type: leaveType }
      }));
    }
  };

  const handleDeleteLeave = async (dateToDelete?: Date) => {
    if (!user) return;
    const dateStr = toLocalISODate(dateToDelete || selectedDate);

    const { error } = await supabase
      .from('shifts')
      .upsert({
        user_id: user.id,
        date: dateStr,
        leave_type: null,
        shift_type: shifts[dateStr]?.shift_type || 'L'
      }, { onConflict: 'user_id,date' });

    if (error) {
      alert('Error al borrar el permiso');
      console.error(error);
    } else {
      setShifts(prev => {
        if (!prev[dateStr]) return prev;
        const updated = { ...prev[dateStr] };
        delete updated.leave_type;
        return { ...prev, [dateStr]: updated };
      });
    }
  };

  const updateLeaveLimit = async (limitType: 'vacation' | 'seniority' | 'owed', value: number) => {
    if (!user) return;
    const column = limitType === 'vacation' ? 'vacation_days_limit' :
      limitType === 'seniority' ? 'seniority_days_limit' : 'owed_days_limit';

    const { error } = await supabase
      .from('profiles')
      .update({ [column]: value })
      .eq('id', user.id);

    if (error) {
      alert('Error al actualizar el límite');
    } else {
      setUserProfile(prev => prev ? { ...prev, [column]: value } : null);
    }
  };

  const handleToggleAlarm = async (enabled: boolean, minutes: number | null = 60, alarmTime: string | null = null) => {
    if (!user || !selectedDate) return;
    const dateStr = toLocalISODate(selectedDate);

    const { error } = await supabase
      .from('shifts')
      .upsert({
        user_id: user.id,
        date: dateStr,
        alarm_enabled: enabled,
        alarm_minutes_before: minutes,
        alarm_time: alarmTime,
        shift_type: shifts[dateStr]?.shift_type || 'L'
      }, { onConflict: 'user_id,date' });

    if (error) {
      console.error(error);
      alert('Error al configurar alarma: ' + error.message);
    } else {
      setShifts(prev => ({
        ...prev,
        [dateStr]: {
          ...(prev[dateStr] || { id: 'temp', user_id: user.id, date: dateStr, shift_type: 'L' }),
          alarm_enabled: enabled,
          alarm_minutes_before: minutes,
          alarm_time: alarmTime
        }
      }));

      if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
        // Request notification permission if enabling
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    }
  };

  const handleCreateExchange = async () => {
    if (!user) return;
    const dateStr = toLocalISODate(selectedDate);
    const currentShift = shifts[dateStr];

    if (!currentShift) {
      alert('Primero debes asignar un turno a este día para poder ofrecerlo.');
      return;
    }

    const exchangeData = {
      user_id: user.id,
      offering_date: dateStr,
      offering_shift_type: currentShift.shift_type,
      description: exchangeDescription,
      status: 'open'
    };

    const { data: insertData, error } = await supabase
      .from('shift_exchanges')
      .insert(exchangeData)
      .select();

    if (error) {
      console.error('SUPABASE INSERT ERROR:', error);
      alert('Error al publicar el cambio: ' + (error.message || 'Código desconocido'));
    } else {
      console.log('Insert success:', insertData);
      alert('¡Cambio publicado correctamente en el mercado!');
      setShowCreateExchange(false);
      setExchangeDescription('');
      await fetchExchanges();
      setActiveTab('market');
    }
  };

  const handleDeleteExchange = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log('Clicked Delete for ID:', id);
    setConfirmModal({
      show: true,
      title: 'Eliminar Oferta',
      message: '¿Estás seguro de que quieres eliminar esta oferta de cambio? Esta acción no se puede deshacer.',
      type: 'delete',
      onConfirm: async () => {
        console.log('Confirmed deletion for ID:', id);
        // Optimistic Update
        const previousExchanges = [...exchanges];
        setExchanges(prev => prev.filter(ex => ex.id !== id));
        setConfirmModal(prev => ({ ...prev, show: false }));

        const { error } = await supabase
          .from('shift_exchanges')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('SUPABASE DELETE ERROR:', error);
          setConfirmModal({
            show: true,
            title: 'Error',
            message: 'No se pudo eliminar la oferta: ' + error.message,
            type: 'error',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false }))
          });
          setExchanges(previousExchanges);
        } else {
          console.log('Delete successful for ID:', id);
          fetchExchanges();
        }
      }
    });
  };

  const handleAcceptExchange = async (exchange: ShiftExchange) => {
    if (!user) return;
    if (exchange.user_id === user.id) {
      alert("No puedes aceptar tu propia oferta.");
      return;
    }

    setConfirmModal({
      show: true,
      title: 'Aceptar Cambio',
      message: `¿Estás seguro de que quieres aceptar este cambio? Se te asignará el turno de ${SHIFT_TYPES.find(t => t.type === exchange.offering_shift_type)?.label} para el día ${new Date(exchange.offering_date).toLocaleDateString()}.`,
      type: 'accept',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        // 1. Assign the shift to me
        const { error: shiftError } = await supabase
          .from('shifts')
          .update({ user_id: user.id })
          .eq('user_id', exchange.user_id)
          .eq('date', exchange.offering_date);

        if (shiftError) {
          console.error("Error updating shift owner", shiftError);
          setConfirmModal({
            show: true,
            title: 'Error',
            message: 'Error al transferir el turno.',
            type: 'error',
            onConfirm: () => setConfirmModal(prev => ({ ...prev, show: false }))
          });
          return;
        }

        // 2. Mark exchange as accepted
        await supabase
          .from('shift_exchanges')
          .update({ status: 'accepted' })
          .eq('id', exchange.id);

        setConfirmModal({
          show: true,
          title: '¡Éxito!',
          message: '¡Cambio aceptado! Ahora el turno aparece en tu calendario.',
          type: 'success',
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, show: false }));
            fetchExchanges();
            fetchShifts();
            setActiveTab('calendar');
          }
        });
      }
    });
  };
  const getMonthStats = () => {
    const counts: Record<string, number> = {};
    let totalHours = 0;
    let annualTotalHours = 0;
    let specialEarnings = 0;

    const hourMap: Record<ShiftType, number> = {
      'M': 7,
      'T': 7,
      'N': 10,
      'M/T': 14,
      'M/N': 17,
      'L': 0,
      'GL': 10,
      'GF': 10
    };

    const pos = userProfile?.position?.toLowerCase() || '';
    let isInterior = pos.startsWith('v') || pos.includes('interior');
    let isSanitario = pos.includes('sanitario') || pos.includes('enfermero') || pos.includes('médico') || pos.includes('guardia');
    let isFisica = pos.includes('física') || pos.includes('fisica');
    let isLocalizada = pos.includes('localizada');

    const currentYearHolidays = getHolidaysForYear(currentDate.getFullYear(), userProfile?.community || 'nacional');
    const holidayKeys = Object.keys(currentYearHolidays);

    const getSpecialPayment = (dateStr: string, type: ShiftType) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const md = `${m}-${d}`;

      // Jueves and Viernes Santo depend on the year
      const juevesSanto = year === 2026 ? '4-2' : '4-17';
      const viernesSanto = year === 2026 ? '4-3' : '4-18';

      // Mode: Sanit. (Calculates GL and GF)
      if (manualRoleOverride === 'sanitario' || (!manualRoleOverride && isSanitario)) {
        if (type === 'GF') {
          const specialDaysSanitarioFisica: Record<string, number> = {
            '1-1': 152, '1-5': 76, '1-6': 76, [juevesSanto]: 152, [viernesSanto]: 152, '5-1': 152, '8-15': 152,
            '10-12': 76, '11-1': 76, '12-6': 152, '12-8': 76, '12-24': 192, '12-25': 152, '12-31': 190
          };
          return specialDaysSanitarioFisica[md] || 0;
        } else if (type === 'GL') {
          const specialDaysSanitarioLocalizada: Record<string, number> = {
            '1-1': 76, '1-5': 38, '1-6': 38, [juevesSanto]: 76, [viernesSanto]: 76, '5-1': 76, '8-15': 76,
            '10-12': 38, '11-1': 38, '12-6': 76, '12-8': 38, '12-24': 95, '12-25': 76, '12-31': 95
          };
          return specialDaysSanitarioLocalizada[md] || 0;
        }
        return 0;
      }

      // Mode: Inter. (Calculates M, T, N, M/T, M/N)
      if (manualRoleOverride === 'interior' || (!manualRoleOverride && isInterior)) {
        const interiorShiftTypes = ['M', 'T', 'N', 'M/T', 'M/N'];
        if (!interiorShiftTypes.includes(type)) return 0;

        const specialDaysDay: Record<string, number> = {
          '1-1': 38, '1-6': 38, [juevesSanto]: 38, [viernesSanto]: 38, '5-1': 38, '8-15': 38,
          '10-12': 19, '11-1': 19, '12-6': 38, '12-8': 19, '12-24': 38, '12-25': 38, '12-31': 38,
          '1-5': 0
        };
        const specialDaysNight: Record<string, number> = {
          '1-1': 76, '1-5': 76, [juevesSanto]: 76, [viernesSanto]: 76, '5-1': 76, '8-15': 76,
          '10-12': 38, '11-1': 38, '12-6': 76, '12-8': 38, '12-24': 114, '12-25': 76, '12-31': 114,
          '1-6': 0
        };

        if (type === 'M' || type === 'T') return specialDaysDay[md] || 0;
        if (type === 'M/T') return (specialDaysDay[md] || 0) * 2;
        if (type === 'M/N') return (specialDaysDay[md] || 0) + (specialDaysNight[md] || 0);
        if (type === 'N') return specialDaysNight[md] || 0;
      }

      return 0;
    };

    Object.values(shifts).forEach(s => {
      const shift = s as ShiftRecord;
      const sDate = new Date(shift.date);
      const isWeekend = sDate.getDay() === 0 || sDate.getDay() === 6;

      // Annual calculation
      if (sDate.getFullYear() === currentDate.getFullYear()) {
        let annualHrs = hourMap[shift.shift_type] || 0;
        const m = sDate.getMonth() + 1;
        const d = sDate.getDate();
        const md = `${m}-${d}`;
        const currentYearHolidays = getHolidaysForYear(currentDate.getFullYear(), userProfile?.community || 'nacional');
        const holidayKeys = Object.keys(currentYearHolidays);
        const isHoliday = holidayKeys.includes(md);

        if ((shift.shift_type === 'GF' || shift.shift_type === 'GL') && (isWeekend || isHoliday)) {
          annualHrs = 24;
        }
        annualTotalHours += annualHrs;
      }

      // Monthly calculation (existing logic)
      if (sDate.getMonth() === currentDate.getMonth() && sDate.getFullYear() === currentDate.getFullYear()) {
        const m = sDate.getMonth() + 1;
        const d = sDate.getDate();
        const md = `${m}-${d}`;
        const currentYearHolidays = getHolidaysForYear(currentDate.getFullYear(), userProfile?.community || 'nacional');
        const holidayKeys = Object.keys(currentYearHolidays);
        const isHoliday = holidayKeys.includes(md);

        counts[shift.shift_type] = (counts[shift.shift_type] || 0) + 1;

        let hrs = hourMap[shift.shift_type] || 0;
        if ((shift.shift_type === 'GF' || shift.shift_type === 'GL') && (isWeekend || isHoliday)) {
          hrs = 24;
        }
        totalHours += hrs;
        specialEarnings += getSpecialPayment(shift.date, shift.shift_type);
      }
    });

    return { counts, totalHours, annualTotalHours, specialEarnings };
  };

  const { counts, totalHours, annualTotalHours, specialEarnings } = getMonthStats();
  const estimatedEarnings = specialEarnings;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return (firstDay + 6) % 7;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-full"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      // Fix timezone offset issue for comparison
      // Simplest way: construct YYYY-MM-DD string locally
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const shift = shifts[dateStr];
      const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === currentDate.getMonth();
      const isToday = new Date().toDateString() === date.toDateString();

      const holiesData = getHolidaysForYear(currentDate.getFullYear(), userProfile?.community || 'nacional');
      const holiesKeys = Object.keys(holiesData);
      const isFestivo = holiesKeys.includes(`${currentDate.getMonth() + 1}-${d}`);

      days.push(
        <button
          key={d}
          onClick={() => {
            if (activePaintShift === 'eraser') {
              handleDeleteShift(date);
            } else if (activePaintShift) {
              handleSaveShift(activePaintShift, date);
            } else if (activePaintOccasion === 'eraser') {
              handleDeleteOccasion(date);
            } else if (activePaintOccasion) {
              handleSaveOccasion(activePaintOccasion, date);
            } else if (activePaintLeave === 'eraser') {
              handleDeleteLeave(date);
            } else if (activePaintLeave) {
              handleSaveLeave(activePaintLeave, date);
            } else {
              setSelectedDate(date);
            }
          }}
          className={`h-9 w-full flex items-center justify-center relative rounded-md transition-all ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}`}
        >
          <span className={`text-sm font-medium z-10 flex items-center justify-center ${isFestivo ? 'size-7 rounded-full border border-red-500/50 text-red-600 dark:text-red-400' : ''} ${isSelected || (shift && shift.shift_type !== 'L') ? 'text-white !border-white/50' : (isFestivo ? '' : 'text-gray-700 dark:text-gray-300')} ${isToday && (!shift || shift.shift_type === 'L') && !isSelected ? 'text-primary font-bold' : ''}`}>
            {d}
          </span>
          {shift && shift.shift_type !== 'L' && (
            <span className={`absolute inset-0 rounded-md ${SHIFT_TYPES.find(t => t.type === shift.shift_type)?.color || 'bg-gray-400'} opacity-80`}></span>
          )}
          {shift?.notes && (
            <div className="absolute top-0.5 left-0.5 size-1 bg-yellow-400 rounded-full z-20 shadow-sm border border-white dark:border-gray-900"></div>
          )}
          {shift?.alarm_enabled && (
            <span className="material-symbols-outlined absolute bottom-0 right-0 size-2 text-[8px] text-white/70 z-20">notifications</span>
          )}
          {shift?.occasion && (
            <div className="absolute -top-1.5 -right-1.5 z-30 flex items-center justify-center size-6 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
              <span className={`material-symbols-outlined text-[14px] ${OCCASIONS.find(o => o.type === shift.occasion)?.color}`}>
                {OCCASIONS.find(o => o.type === shift.occasion)?.icon}
              </span>
            </div>
          )}
          {shift?.leave_type && (
            <div className="absolute -bottom-1.5 -left-1.5 z-30 flex items-center justify-center size-6 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
              <span className={`material-symbols-outlined text-[14px] ${LEAVE_TYPES.find(l => l.type === shift.leave_type)?.color}`}>
                {LEAVE_TYPES.find(l => l.type === shift.leave_type)?.icon}
              </span>
            </div>
          )}
        </button>
      );
    }
    return days;
  };

  const renderYearlyCalendar = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return (
      <div className="grid grid-cols-2 gap-3 px-2">
        {months.map(month => {
          const monthDate = new Date(currentDate.getFullYear(), month, 1);
          const daysInMonth = new Date(currentDate.getFullYear(), month + 1, 0).getDate();
          return (
            <div key={month} className="bg-white dark:bg-surface-dark p-2 rounded-xl border border-gray-100 dark:border-gray-800">
              <h4 className="text-[10px] font-bold uppercase mb-2 text-center text-primary">
                {monthDate.toLocaleDateString('es-ES', { month: 'short' })}
              </h4>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: daysInMonth }).map((_, dIdx) => {
                  const d = dIdx + 1;
                  const dStr = `${currentDate.getFullYear()}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const shift = shifts[dStr];
                  const st = shift ? SHIFT_TYPES.find(t => t.type === shift.shift_type) : null;
                  return (
                    <div
                      key={d}
                      className={`size-2.5 rounded-[1px] ${st ? st.color : 'bg-gray-100 dark:bg-gray-800'} ${shift?.notes ? 'ring-[0.5px] ring-yellow-400' : ''}`}
                      title={`${d} ${monthDate.toLocaleDateString('es-ES', { month: 'short' })}: ${st?.label || 'Libre'}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const selectedDateStr = selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  // YYYY-MM-DD for lookup
  const selYear = selectedDate.getFullYear();
  const selMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const selDay = String(selectedDate.getDate()).padStart(2, '0');
  const selIsoDate = `${selYear}-${selMonth}-${selDay}`;
  const selectedShift = shifts[selIsoDate];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white min-h-screen flex flex-col overflow-x-hidden pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 h-16">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight">Gestión de Turnos</h1>
          <button
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              setSelectedDate(today);
              setViewMode('month');
            }}
            className="flex items-center justify-center h-8 px-4 rounded-full bg-primary text-white text-xs font-black shadow-sm active:scale-95 transition-all"
          >
            Hoy
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 py-4">
        <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-200 dark:bg-surface-dark p-1">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex h-full flex-1 items-center justify-center rounded-lg px-2 text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-white dark:bg-[#2c3442] shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Mi Calendario
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex h-full flex-1 items-center justify-center rounded-lg px-2 text-sm font-bold transition-all ${activeTab === 'market' ? 'bg-white dark:bg-[#2c3442] shadow-sm text-primary' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Mercado de Cambios
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'calendar' ? (
        <>
          {/* Paint Toolbar */}
          <div className="px-4 mb-2">
            <div className="flex flex-col gap-2 bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Turnos</span>
                {(activePaintShift || activePaintOccasion || activePaintLeave) && (
                  <button
                    onClick={() => {
                      setActivePaintShift(null);
                      setActivePaintOccasion(null);
                      setActivePaintLeave(null);
                    }}
                    className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                    Desactivar modo pintar
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => {
                    setActivePaintOccasion(null);
                    setActivePaintLeave(null);
                    setActivePaintShift(activePaintShift === 'eraser' ? null : 'eraser');
                  }}
                  className={`flex-shrink-0 min-w-[50px] px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 flex items-center gap-1 ${activePaintShift === 'eraser'
                    ? `bg-red-500 text-white border-transparent scale-105 shadow-md`
                    : `border-transparent bg-gray-100 dark:bg-gray-800 text-red-500`
                    }`}
                >
                  <span className="material-symbols-outlined text-sm">auto_fix_off</span>
                  BORRAR
                </button>
                {SHIFT_TYPES.map(st => (
                  <button
                    key={st.type}
                    onClick={() => {
                      setActivePaintOccasion(null);
                      setActivePaintLeave(null);
                      setActivePaintShift(activePaintShift === st.type ? null : st.type);
                    }}
                    className={`flex-shrink-0 min-w-[50px] px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 ${activePaintShift === st.type
                      ? `${st.color} text-white border-transparent scale-105 shadow-md`
                      : `border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400`
                      }`}
                  >
                    {st.type}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ocasiones Especiales</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <button
                    onClick={() => {
                      setActivePaintShift(null);
                      setActivePaintLeave(null);
                      setActivePaintOccasion(activePaintOccasion === 'eraser' ? null : 'eraser');
                    }}
                    className={`flex-shrink-0 min-w-[50px] px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 flex items-center gap-1 ${activePaintOccasion === 'eraser'
                      ? `bg-red-200 text-red-700 border-transparent scale-105 shadow-md`
                      : `border-transparent bg-gray-100 dark:bg-gray-800 text-red-400`
                      }`}
                  >
                    <span className="material-symbols-outlined text-sm">ink_eraser</span>
                    QUITAR
                  </button>
                  {OCCASIONS.map(occ => (
                    <button
                      key={occ.type}
                      onClick={() => {
                        setActivePaintShift(null);
                        setActivePaintLeave(null);
                        setActivePaintOccasion(activePaintOccasion === occ.type ? null : occ.type);
                      }}
                      className={`flex-shrink-0 size-9 flex items-center justify-center rounded-lg transition-all border-2 ${activePaintOccasion === occ.type
                        ? `bg-primary/20 border-primary scale-110 shadow-md`
                        : `border-transparent bg-gray-100 dark:bg-gray-800`
                        }`}
                      title={occ.label}
                    >
                      <span className={`material-symbols-outlined ${occ.color} text-4xl`}>{occ.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Permisos</span>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                      onClick={() => {
                        setActivePaintShift(null);
                        setActivePaintOccasion(null);
                        setActivePaintLeave(activePaintLeave === 'eraser' ? null : 'eraser');
                      }}
                      className={`flex-shrink-0 min-w-[50px] px-3 py-2 rounded-lg text-xs font-bold transition-all border-2 flex items-center gap-1 ${activePaintLeave === 'eraser'
                        ? `bg-red-100 text-red-600 border-transparent scale-105 shadow-md`
                        : `border-transparent bg-gray-100 dark:bg-gray-800 text-red-400`
                        }`}
                    >
                      <span className="material-symbols-outlined text-sm">block</span>
                      QUITAR
                    </button>
                    {LEAVE_TYPES.map(leave => {
                      const used = (Object.values(shifts) as ShiftRecord[]).filter(s => s.leave_type === leave.type).length;
                      let limit = 0;
                      if (leave.type === 'vacation') limit = userProfile?.vacation_days_limit || 22;
                      if (leave.type === 'seniority') limit = userProfile?.seniority_days_limit || 6;
                      if (leave.type === 'owed') limit = userProfile?.owed_days_limit || 0;

                      return (
                        <div key={leave.type} className="flex flex-col gap-1 items-center">
                          <button
                            onClick={() => {
                              setActivePaintShift(null);
                              setActivePaintOccasion(null);
                              setActivePaintLeave(activePaintLeave === leave.type ? null : leave.type);
                            }}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg transition-all border-2 flex items-center gap-2 ${activePaintLeave === leave.type
                              ? `bg-primary/20 border-primary scale-105 shadow-md`
                              : `border-transparent bg-gray-100 dark:bg-gray-800`
                              }`}
                          >
                            <span className={`material-symbols-outlined ${leave.color} text-3xl`}>{leave.icon}</span>
                            <div className="flex flex-col items-start leading-none">
                              <span className="text-[9px] font-black uppercase text-gray-500">{leave.label.split(' ')[0]}</span>
                              <span className={`text-[12px] font-black ${used >= limit && limit > 0 ? 'text-red-500' : 'text-primary'}`}>
                                {limit > 0 ? limit - used : used}
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Limits Selectors Row */}
                  <div className="flex items-center gap-3 py-1 px-1 bg-gray-50 dark:bg-gray-800/30 rounded-lg overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[8px] font-black text-gray-400 uppercase">Tot. Vac:</span>
                      <select
                        value={userProfile?.vacation_days_limit || 22}
                        onChange={(e) => updateLeaveLimit('vacation', parseInt(e.target.value))}
                        className="text-[10px] font-bold bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 outline-none text-primary"
                      >
                        {[22, 23, 24, 25, 26].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 border-l border-gray-200 dark:border-gray-700 pl-3">
                      <span className="text-[8px] font-black text-gray-400 uppercase">Tot. AP:</span>
                      <select
                        value={userProfile?.seniority_days_limit || 6}
                        onChange={(e) => updateLeaveLimit('seniority', parseInt(e.target.value))}
                        className="text-[10px] font-bold bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 outline-none text-primary"
                      >
                        {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 border-l border-gray-200 dark:border-gray-700 pl-3">
                      <span className="text-[8px] font-black text-gray-400 uppercase">Tot. Deb:</span>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={userProfile?.owed_days_limit || 0}
                        onChange={(e) => updateLeaveLimit('owed', parseInt(e.target.value) || 0)}
                        className="w-10 text-[10px] font-bold bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 outline-none text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-gray-400 italic">
                {activePaintShift
                  ? `Pulsando días asignarás el turno "${SHIFT_TYPES.find(t => t.type === activePaintShift)?.label || 'Borrador'}"`
                  : activePaintOccasion
                    ? `Pulsando días asignarás "${OCCASIONS.find(o => o.type === activePaintOccasion)?.label || 'Quitar ocasión'}"`
                    : activePaintLeave
                      ? `Pulsando días asignarás permiso de "${LEAVE_TYPES.find(l => l.type === activePaintLeave)?.label || 'Quitar permiso'}"`
                      : 'Selecciona un elemento para pintar días rápidamente'}
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - (viewMode === 'year' ? 1 : 0), currentDate.getMonth() - (viewMode === 'month' ? 1 : 0), 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold capitalize">
                    {currentDate.toLocaleDateString('es-ES', viewMode === 'month' ? { month: 'long', year: 'numeric' } : { year: 'numeric' })}
                  </span>
                  {/* Removed Resumen Anual */}
                </div>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + (viewMode === 'year' ? 1 : 0), currentDate.getMonth() + (viewMode === 'month' ? 1 : 0), 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              {viewMode === 'month' ? (
                <>
                  <div className="grid grid-cols-7 gap-y-2 mb-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="text-center text-xs font-bold text-gray-400">{d}</div>)}
                    {renderCalendarDays()}
                  </div>

                  {/* Monthly Stats Summary Inline */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Horas</span>
                      <span className="text-sm font-black text-primary">
                        {totalHours}h
                        {currentDate.getMonth() === 11 && (
                          <span className="text-[10px] ml-1 opacity-60 font-medium">({annualTotalHours}h total año)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Ingresos</span>
                        <select
                          className="text-[8px] bg-gray-100 dark:bg-gray-800 border-none rounded p-0 px-1 font-black text-primary focus:ring-0"
                          value={manualRoleOverride || (userProfile?.position?.toLowerCase().includes('sanitario') ? 'sanitario_localizada' : 'interior')}
                          onChange={(e) => setManualRoleOverride(e.target.value as any)}
                        >
                          <option value="interior">Inter.</option>
                          <option value="sanitario">Sanit.</option>
                        </select>
                      </div>
                      <span className="text-sm font-black text-emerald-500">{estimatedEarnings}€</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Turnos</span>
                      <div className="flex -space-x-1 mt-1">
                        {Object.keys(counts).filter(c => c !== 'L').slice(0, 3).map(c => (
                          <div key={c} className={`size-4 rounded-full border-2 border-white dark:border-surface-dark ${SHIFT_TYPES.find(t => t.type === c)?.color}`}></div>
                        ))}
                        {Object.keys(counts).length > 3 && <span className="text-[8px] pl-1.5 font-bold text-gray-400">+{Object.keys(counts).length - 3}</span>}
                      </div>
                    </div>
                  </div>
                </>
              ) : renderYearlyCalendar()}
            </div>
          </div>

          <div className="px-4 mb-6">
            <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest">{selectedDateStr}</p>
                    {getHolidaysForYear(selectedDate.getFullYear(), userProfile?.community || 'nacional')[`${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`] && (
                      <p className="text-gray-400 text-[9px] font-bold">
                        • {getHolidaysForYear(selectedDate.getFullYear(), userProfile?.community || 'nacional')[`${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`]}
                      </p>
                    )}
                    {selectedShift?.alarm_enabled && (
                      <span className="material-symbols-outlined text-emerald-500 text-xs animate-pulse">notifications_active</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold leading-tight">
                    {selectedShift
                      ? SHIFT_TYPES.find(t => t.type === selectedShift.shift_type)?.label
                      : 'Sin turno asignado'}
                  </h2>
                  {selectedShift?.occasion && (
                    <div className="flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className={`material-symbols-outlined text-2xl ${OCCASIONS.find(o => o.type === selectedShift.occasion)?.color}`}>
                        {OCCASIONS.find(o => o.type === selectedShift.occasion)?.icon}
                      </span>
                      <span className="text-[10px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {OCCASIONS.find(o => o.type === selectedShift.occasion)?.label}
                      </span>
                    </div>
                  )}
                  {selectedShift?.leave_type && (
                    <div className="flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className={`material-symbols-outlined text-2xl ${LEAVE_TYPES.find(l => l.type === selectedShift.leave_type)?.color}`}>
                        {LEAVE_TYPES.find(l => l.type === selectedShift.leave_type)?.icon}
                      </span>
                      <span className="text-[10px] font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {LEAVE_TYPES.find(l => l.type === selectedShift.leave_type)?.label}
                      </span>
                    </div>
                  )}
                </div>
                {selectedShift && (
                  <div className={`size-10 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${SHIFT_TYPES.find(t => t.type === selectedShift.shift_type)?.color}`}>
                    {selectedShift.shift_type}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="relative">
                <textarea
                  value={selectedShift?.notes || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShifts(prev => ({
                      ...prev,
                      [selIsoDate]: { ...(prev[selIsoDate] || { id: 'temp', user_id: user?.id || '', date: selIsoDate, shift_type: 'L' }), notes: val }
                    }));
                  }}
                  onBlur={(e) => handleSaveNote(e.target.value)}
                  placeholder="Añadir nota personal..."
                  className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl border-none focus:ring-1 ring-primary/30 outline-none resize-none min-h-[60px] dark:text-gray-200 placeholder:text-gray-400 transition-all"
                />
                {isSavingNote && (
                  <div className="absolute top-2 right-2 size-2 bg-primary rounded-full animate-ping"></div>
                )}
              </div>

              {/* Quick Actions & Alarms */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400">alarm</span>
                      <div>
                        <p className="text-xs font-bold dark:text-white">Alarma Automática</p>
                        <p className="text-[10px] text-gray-500">Notificar antes del turno</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleAlarm(!selectedShift?.alarm_enabled, selectedShift?.alarm_minutes_before ?? (selectedShift?.alarm_time ? null : 60), selectedShift?.alarm_time)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${selectedShift?.alarm_enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${selectedShift?.alarm_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {selectedShift?.alarm_enabled && (
                    <div className="flex flex-col gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">TIPO DE ALARMA</span>
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                          <button
                            onClick={() => handleToggleAlarm(true, 60, null)}
                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${selectedShift.alarm_minutes_before !== null ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500'}`}
                          >
                            Relativa
                          </button>
                          <button
                            onClick={() => handleToggleAlarm(true, null, '08:00')}
                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${selectedShift.alarm_minutes_before === null ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-gray-500'}`}
                          >
                            Fija
                          </button>
                        </div>
                      </div>

                      {selectedShift.alarm_minutes_before !== null ? (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-500">Antelación:</span>
                          <select
                            value={selectedShift?.alarm_minutes_before || 60}
                            onChange={(e) => handleToggleAlarm(true, parseInt(e.target.value), null)}
                            className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] px-2 py-1 outline-none font-bold text-primary"
                          >
                            <option value="15">15 min antes</option>
                            <option value="30">30 min antes</option>
                            <option value="45">45 min antes</option>
                            <option value="60">1 hora antes</option>
                            <option value="90">1.5 horas antes</option>
                            <option value="120">2 horas antes</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-500">Hora exacta:</span>
                          <input
                            type="time"
                            value={selectedShift?.alarm_time || '08:00'}
                            onChange={(e) => handleToggleAlarm(true, null, e.target.value)}
                            className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-xs px-2 py-1 outline-none font-bold text-primary"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowShiftSelector(true)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">edit_calendar</span>
                    {selectedShift ? 'Editar' : 'Asignar'}
                  </button>
                  {selectedShift && selectedShift.shift_type !== 'L' && (
                    <button
                      onClick={async () => {
                        // Refresh profile info just in case before opening modal
                        if (user) {
                          const { data } = await supabase.from('profiles').select('workspace, position').eq('id', user.id).single();
                          if (data) setUserProfile(data);
                        }
                        setShowCreateExchange(true);
                      }}
                      className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">swap_horiz</span>
                      Cambiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Ofertas en Directo</h2>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full">{exchanges.length} ACTIVAS</span>
          </div>

          {/* Workspace Filter Chips */}
          {exchanges.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 mb-2">
              <button
                onClick={() => setFilterWorkspace('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filterWorkspace === 'all'
                  ? 'bg-primary border-primary text-white shadow-md'
                  : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 text-gray-500'
                  }`}
              >
                Todos
              </button>
              {Array.from(new Set(exchanges.map(ex => (ex as any).profiles?.workspace).filter(Boolean))).sort().map(ws => (
                <button
                  key={ws as string}
                  onClick={() => setFilterWorkspace(ws as string)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${filterWorkspace === ws
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 text-gray-500'
                    }`}
                >
                  {ws as string}
                </button>
              ))}
            </div>
          )}

          {exchanges.filter(ex =>
            filterWorkspace === 'all' || (ex as any).profiles?.workspace === filterWorkspace
          ).length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <span className="material-symbols-outlined text-[64px] mb-4 text-gray-300">
                {filterWorkspace === 'all' ? 'swipe_vertical' : 'filter_list_off'}
              </span>
              <p className="text-gray-500 font-medium">
                {filterWorkspace === 'all'
                  ? 'El mercado está tranquilo hoy...'
                  : `Sin ofertas en "${filterWorkspace}"`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {filterWorkspace === 'all'
                  ? '¡Sé el primero en publicar un cambio!'
                  : 'Prueba con otro centro o borra el filtro.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {exchanges
                .filter(ex => filterWorkspace === 'all' || (ex as any).profiles?.workspace === filterWorkspace)
                .map(ex => {
                  const typeData = SHIFT_TYPES.find(t => t.type === ex.offering_shift_type);
                  return (
                    <div key={ex.id} className="relative overflow-hidden bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 transition-transform active:scale-[0.98]">
                      {/* Decorative side color */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${typeData?.color}`}></div>

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <span className="material-symbols-outlined text-gray-500">person</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">{(ex as any).profiles?.full_name || 'Compañero'}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-tight">
                              {(ex as any).profiles?.workspace || 'N/A'} · {(ex as any).profiles?.position || 'N/A'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{new Date(ex.offering_date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <div className={`px-2 py-1 rounded text-[10px] font-black uppercase text-white ${typeData?.color}`}>
                            Turno {ex.offering_shift_type}
                          </div>
                          {user && (ex.user_id === user.id || isAdmin) && (
                            <button
                              onClick={(e) => handleDeleteExchange(e, ex.id)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 p-1.5 rounded-full transition-colors"
                              title="Eliminar oferta"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                          "{ex.description || 'Busco cambio para este día...'}"
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptExchange(ex)}
                          className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Aceptar
                        </button>
                        <button
                          onClick={() => window.open(`https://wa.me/?text=Hola, estoy interesado en tu cambio de CSIF para el día ${ex.offering_date}`, '_blank')}
                          className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )
      }

      {/* Shift Selector Modal */}
      {
        showShiftSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-sm rounded-2xl p-6 shadow-xl transform transition-all scale-100">
              <h3 className="text-lg font-bold mb-4 text-center dark:text-white">Selecciona Turno</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {SHIFT_TYPES.map(st => (
                  <button
                    key={st.type}
                    onClick={() => handleSaveShift(st.type)}
                    className={`${st.color} text-white py-2 rounded-lg text-[10px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-center leading-tight`}
                  >
                    {st.label}
                  </button>
                ))}
                <button
                  onClick={() => handleDeleteShift()}
                  className="col-span-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-3 rounded-lg font-bold shadow-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">delete</span>
                  BORRAR TURNO EXISTENTE
                </button>
              </div>
              <button
                onClick={() => setShowShiftSelector(false)}
                className="w-full py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        )
      }

      {/* Create Exchange Modal */}
      {
        showCreateExchange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-sm rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold mb-1 text-center dark:text-white">Solicitar Cambio</h3>
              <p className="text-xs text-gray-500 text-center mb-4">
                Ofreces tu turno de {selectedShift ? SHIFT_TYPES.find(t => t.type === selectedShift.shift_type)?.label : ''} del {selectedDate.toLocaleDateString()}
              </p>

              <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Centro</label>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-bold dark:text-white border border-gray-100 dark:border-gray-700">
                      {userProfile?.workspace || 'No configurado'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Puesto</label>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-bold dark:text-white border border-gray-100 dark:border-gray-700">
                      {userProfile?.position || 'No configurado'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nota (opcional)</label>
                  <textarea
                    value={exchangeDescription}
                    onChange={e => setExchangeDescription(e.target.value)}
                    placeholder="Ej: Busco turno de mañana, o cualquier tarde..."
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm focus:ring-2 ring-primary outline-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateExchange(false)}
                  className="flex-1 py-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateExchange}
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-bold shadow-md hover:bg-blue-700"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        )
      }

      <BottomNavigation />

      {/* Custom Global Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl transform transition-all scale-100 border border-gray-100 dark:border-gray-800">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${confirmModal.type === 'delete' ? 'bg-red-100 text-red-600' :
                  confirmModal.type === 'accept' ? 'bg-blue-100 text-blue-600' :
                    confirmModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-orange-100 text-orange-600'
                  }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {confirmModal.type === 'delete' ? 'delete_forever' :
                      confirmModal.type === 'accept' ? 'check_circle' :
                        confirmModal.type === 'success' ? 'verified' :
                          'error'}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2 dark:text-white">{confirmModal.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex border-t border-gray-100 dark:border-gray-800">
              {confirmModal.type !== 'success' && confirmModal.type !== 'error' && (
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="flex-1 py-4 text-sm font-bold border-r border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-4 text-sm font-black transition-colors ${confirmModal.type === 'delete' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10' :
                  confirmModal.type === 'success' ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10' :
                    'text-primary hover:bg-blue-50 dark:hover:bg-blue-900/10'
                  }`}
              >
                {confirmModal.type === 'success' || confirmModal.type === 'error' ? 'Entendido' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftsPage;