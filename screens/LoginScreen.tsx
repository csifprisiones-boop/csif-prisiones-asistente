import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import csifLogo from '../csif-logo-green.png';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [dniFragment, setDniFragment] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const validateDniFragment = (dni: string) => {
        // Validation for: 2 digits + 3 digits + 1 letter (e.g. 12123A)
        // Total 6 chars usually? User said: "2 primeras cifras DNI + 3 últimas cifras DNI + letra DNI"
        // That implies 2 + 3 + 1 = 6 chars. 
        // Let's implement regex: ^\d{5}[A-Za-z]$ or ^\d{2}\d{3}[A-Za-z]$ which is same as ^\d{5}[A-Za-z]$
        const regex = /^\d{5}[A-Za-z]$/;
        return regex.test(dni);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                if (!fullName.trim()) throw new Error('El nombre es obligatorio');
                if (!validateDniFragment(dniFragment)) {
                    throw new Error('El formato del DNI debe ser: 2 primeras cifras + 3 últimas cifras + Letra (ej: 12345A)');
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            dni_fragment: dniFragment,
                        },
                    },
                });
                if (error) throw error;
                alert('Registro exitoso! Tu cuenta está pendiente de aprobación por el administrador.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src={csifLogo}
                        alt="CSIF Logo"
                        className="w-48 h-auto mb-2"
                    />
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight text-center">
                        {isLogin ? 'Acceso Asistente CSIF' : 'Registro Nuevo Usuario'}
                    </h2>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Identificación (2 ini + 3 fin + Letra)</label>
                                <input
                                    type="text"
                                    value={dniFragment}
                                    onChange={(e) => setDniFragment(e.target.value.toUpperCase())}
                                    placeholder="Ej: 12345A"
                                    maxLength={6}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Introduce las 2 primeras cifras, las 3 últimas y la letra de tu DNI.
                                </p>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-sm text-primary hover:text-primary-dark"
                    >
                        {isLogin ? '¿No tienes cuenta? Crear una ahora' : '¿Ya tienes cuenta? Iniciar Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};
