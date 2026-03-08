import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const redirectUrl = window.location.origin + '/dashboard';
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        Object.keys(sessionStorage).forEach(k => { if (k.startsWith('savify')) sessionStorage.removeItem(k); });
        Object.keys(localStorage).forEach(k => { if (k.startsWith('savify')) localStorage.removeItem(k); });
        await supabase.auth.signOut();
    };

    return { user, session, loading, signInWithGoogle, signOut };
}
