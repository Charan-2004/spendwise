import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const createDefaultProfile = async (userId, email) => {
        try {
            console.log('Creating default profile for user:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .insert([{
                    id: userId,
                    email: email,
                    full_name: email?.split('@')[0] || 'User',
                    monthly_income: 0,
                    fixed_expenses: 0,
                    currency: 'USD'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating default profile:', error);
            return null;
        }
    };

    const fetchProfile = async (userId, email, retries = 3) => {
        // Try to load from localStorage first while fetching
        const cachedProfile = localStorage.getItem(`profile_${userId}`);
        if (cachedProfile) {
            try {
                const parsed = JSON.parse(cachedProfile);
                console.log('Using cached profile while fetching fresh data');
                setProfile(parsed);
            } catch (e) {
                console.error('Error parsing cached profile:', e);
            }
        }

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                console.log(`Fetching profile for: ${userId} (attempt ${attempt + 1}/${retries})`);

                const fetchPromise = supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
                );

                const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

                // If profile doesn't exist (PGRST116), create it
                if (error && error.code === 'PGRST116') {
                    console.log('Profile not found, creating default profile');
                    const newProfile = await createDefaultProfile(userId, email);
                    if (newProfile) {
                        setProfile(newProfile);
                        localStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
                        return;
                    }
                }

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                if (data) {
                    console.log('Profile fetched successfully:', data);
                    setProfile(data);
                    // Cache in localStorage
                    localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
                    return;
                }

            } catch (error) {
                console.error(`Error fetching profile (attempt ${attempt + 1}):`, error);

                // If this is the last attempt, use fallback
                if (attempt === retries - 1) {
                    console.warn('All retry attempts failed, using fallback profile');
                    const fallbackProfile = {
                        id: userId,
                        currency: 'USD',
                        monthly_income: 0,
                        fixed_expenses: 0
                    };
                    setProfile(fallbackProfile);
                    return;
                }

                // Exponential backoff before retry
                await sleep(1000 * Math.pow(2, attempt));
            }
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
                await fetchProfile(session.user.id, session.user.email);
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
                await fetchProfile(session.user.id, session.user.email);
            } else {
                setProfile(null);
                // Clear cached profile on signout
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('profile_')) {
                        localStorage.removeItem(key);
                    }
                });
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
        signInWithGoogle: () => supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        }),
        signOut: () => supabase.auth.signOut(),
        user,
        profile,
        refreshProfile: () => user && fetchProfile(user.id, user.email),
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
