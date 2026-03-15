import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getProfile } from '../lib/supabase.js';

// ─── Niveaux & étoiles ────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 0, name: 'Recrue',      minStars: 0,   color: 'text-slate-400',  bg: 'bg-slate-500/20'  },
  { level: 1, name: 'Pilote',      minStars: 5,   color: 'text-green-400',  bg: 'bg-green-500/20'  },
  { level: 2, name: 'Vétéran',     minStars: 15,  color: 'text-blue-400',   bg: 'bg-blue-500/20'   },
  { level: 3, name: 'Commandant',  minStars: 40,  color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { level: 4, name: 'Amiral',      minStars: 100, color: 'text-gold-400',   bg: 'bg-yellow-500/20' },
  { level: 5, name: 'Légende',     minStars: 250, color: 'text-cyan-400',   bg: 'bg-cyan-500/20'   },
];

export function getLevelInfo(stars) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (stars >= l.minStars) current = l;
    else break;
  }
  const nextIdx = LEVELS.indexOf(current) + 1;
  const next = LEVELS[nextIdx] ?? null;
  const progress = next
    ? Math.round(((stars - current.minStars) / (next.minStars - current.minStars)) * 100)
    : 100;
  return { ...current, next, progress };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // auth.users row
  const [profile, setProfile] = useState(null);   // profiles row
  const [loading, setLoading] = useState(true);

  // Rôle calculé depuis profile
  const role = profile?.role ?? 'guest';
  const isAdmin = role === 'admin';
  const isMod   = role === 'moderator' || isAdmin;
  const isActive = profile?.status === 'active';

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser || !isSupabaseConfigured) {
      setProfile(null);
      return;
    }
    try {
      const p = await getProfile(authUser.id);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Session initiale (avec retry x2 en cas d'erreur réseau)
    const initSession = async (attempt = 0) => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
        if (session?.user) await loadProfile(session.user);
      } catch {
        if (attempt < 2) {
          setTimeout(() => initSession(attempt + 1), 1500 * (attempt + 1));
          return;
        }
        setUser(null);
      } finally {
        if (attempt === 0 || attempt >= 2) setLoading(false);
      }
    };
    initSession();

    // Écoute les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email, password, username) {
    if (!password || password.length < 8)
      throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
    if (!/[A-Z]/.test(password))
      throw new Error('Le mot de passe doit contenir au moins une majuscule.');
    if (!/[0-9]/.test(password))
      throw new Error('Le mot de passe doit contenir au moins un chiffre.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user);
  }

  const value = {
    user,
    profile,
    role,
    isAdmin,
    isMod,
    isActive,
    loading,
    isConfigured: isSupabaseConfigured,
    levelInfo: getLevelInfo(profile?.stars ?? 0),
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
