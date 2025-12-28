import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true, signOut: async () => { } });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkApprovalAndSetUser = async (session: Session | null) => {
            if (session?.user) {
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_approved')
                    .eq('id', session.user.id)
                    .single();

                if (profile && !profile.is_approved) {
                    await supabase.auth.signOut();
                    setSession(null);
                    setUser(null);
                    setLoading(false);
                    alert('Tu cuenta aún no ha sido aprobada por el administrador.');
                    return;
                }

                setSession(session);
                setUser(session.user);

                // Log access only if approved
                logAccess(session.user.id);
            } else {
                setSession(null);
                setUser(null);
            }
            setLoading(false);
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            checkApprovalAndSetUser(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
                checkApprovalAndSetUser(session);
            } else if (_event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const logAccess = async (userId: string) => {
        try {
            await supabase.from('access_logs').insert({
                user_id: userId,
                action: 'login_or_app_open'
            });
        } catch (error) {
            console.error('Error logging access:', error);
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
