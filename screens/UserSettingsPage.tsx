import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../components/AuthProvider';
import { WORKSPACES_DATA, POSITIONS_LIST } from '../constants/workspaces';
import { COMMUNITIES } from '../constants/provinces';

const UserSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>({
        full_name: '',
        phone: '',
        workspace: '',
        position: '',
        community: ''
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isCustomPosition, setIsCustomPosition] = useState(false);

    const workspaces = Object.keys(WORKSPACES_DATA).sort();
    const positions = POSITIONS_LIST.sort();
    const communities = COMMUNITIES.sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();

        if (data) {
            const pos = data.position || '';
            const isCustom = pos && !POSITIONS_LIST.includes(pos);
            setProfile({
                full_name: data.full_name || '',
                phone: data.phone || '',
                workspace: data.workspace || '',
                position: pos,
                community: data.community || ''
            });
            setIsCustomPosition(isCustom);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // 1. Update Profile in DB
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                    workspace: profile.workspace,
                    position: profile.position,
                    community: profile.community
                })
                .eq('id', user?.id);

            if (profileError) throw profileError;

            // 2. Update Email if changed
            if (email !== user?.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email });
                if (emailError) throw emailError;
            }

            // 3. Update Password if provided
            if (password) {
                const { error: passError } = await supabase.auth.updateUser({ password });
                if (passError) throw passError;
                setPassword(''); // Clear password field
            }

            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error al actualizar el perfil' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-10">
            <header className="sticky top-0 z-40 bg-background-light dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between p-4 h-16">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold">Mis Datos</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4 sm:p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Auth Section */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Cuenta</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={password}
                                    placeholder="Dejar en blanco para no cambiar"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personal Data Section */}
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Información Profesional</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary outline-none transition-all"
                                    placeholder="Ej: 600 000 000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Comunidad Autónoma</label>
                                <select
                                    value={profile.community}
                                    onChange={(e) => setProfile({ ...profile, community: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary outline-none transition-all appearance-none"
                                >
                                    <option value="">Selecciona una comunidad</option>
                                    {communities.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Centro de Trabajo</label>
                                <select
                                    value={profile.workspace}
                                    onChange={(e) => setProfile({ ...profile, workspace: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary outline-none transition-all appearance-none"
                                >
                                    <option value="">Selecciona un centro</option>
                                    {workspaces.map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Puesto de Trabajo</label>
                                <select
                                    value={isCustomPosition ? 'OTRO' : profile.position}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'OTRO') {
                                            setIsCustomPosition(true);
                                            setProfile({ ...profile, position: '' });
                                        } else {
                                            setIsCustomPosition(false);
                                            setProfile({ ...profile, position: val });
                                        }
                                    }}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary outline-none transition-all appearance-none"
                                >
                                    <option value="">Selecciona un puesto</option>
                                    {positions.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                    <option value="OTRO">OTRO (Especificar...)</option>
                                </select>
                                {isCustomPosition && (
                                    <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <input
                                            type="text"
                                            value={profile.position}
                                            onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                                            placeholder="Escribe tu puesto de trabajo"
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                Guardar Cambios
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate('/login');
                        }}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-2xl transition-all mb-4"
                    >
                        Cerrar Sesión
                    </button>
                </form>
            </main>
        </div>
    );
};

export default UserSettingsPage;
