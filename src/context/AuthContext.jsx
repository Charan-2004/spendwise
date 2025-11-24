import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        try {
            console.log('Fetching profile for:', userId);
            const fetchPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
            );

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            if (data) {
                console.log('Profile fetched successfully:', data);
                setProfile(data);
            } else {
                console.log('No profile found or error, using default');
                setProfile({ currency: 'USD' });
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error);
            setProfile({ currency: 'USD' });
        }
    };

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth check timed out, forcing load');
                setLoading(false);
            }
        }, 3000);

        // Check active sessions and sets the user
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!mounted) return;
            console.log('Session checked', session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setLoading(false);
            clearTimeout(timer);
        }).catch(err => {
            console.error('Session check failed', err);
            setLoading(false);
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;
            console.log('Auth state changed', _event, session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        user,
        profile,
        refreshProfile: () => user && fetchProfile(user.id),
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
