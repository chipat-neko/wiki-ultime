import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../core/AuthContext.jsx';
import { Server, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff, Rocket } from 'lucide-react';
import clsx from 'clsx';

const INPUT_CLASS = 'w-full bg-space-800 border border-space-400/30 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors text-sm';
const LABEL_CLASS = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function Login() {
  const { user, isActive, loading, signIn, signUp, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]         = useState('login'); // 'login' | 'register'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Redirige si déjà connecté et actif
  if (!loading && user && isActive) return <Navigate to="/profil" replace />;

  // Compte en attente après inscription
  if (!loading && user && !isActive) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-space-900 border border-space-400/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Compte en attente</h2>
          <p className="text-slate-400 text-sm mb-6">
            Ton compte a bien été créé. Un admin ou modérateur doit valider ton accès avant que tu puisses contribuer au wiki.
            Tu recevras un e-mail dès que ton compte sera approuvé.
          </p>
          <button
            onClick={signOut}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-space-900 border border-yellow-500/30 rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Supabase non configuré</h2>
          <p className="text-slate-400 text-sm">
            Les variables <code className="text-cyan-400">VITE_SUPABASE_URL</code> et <code className="text-cyan-400">VITE_SUPABASE_ANON_KEY</code> ne sont pas définies.
            Configure-les dans <code className="text-slate-300">.env</code> pour activer l'authentification.
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (tab === 'login') {
        await signIn(email, password);
        navigate('/profil');
      } else {
        const u = username.trim();
        if (u.length < 3) throw new Error('Le pseudo doit faire au moins 3 caractères.');
        if (u.length > 30) throw new Error('Le pseudo ne peut pas dépasser 30 caractères.');
        if (!/^[a-zA-Z0-9_]+$/.test(u)) throw new Error('Le pseudo ne peut contenir que des lettres, chiffres et underscores.');
        if (password.length < 8) throw new Error('Le mot de passe doit faire au moins 8 caractères.');
        await signUp(email, password, u);
        setSuccess('Compte créé ! En attente de validation par un admin.');
      }
    } catch (err) {
      setError(err.message ?? 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
            <Server className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">SC COMPANION</h1>
          <p className="text-slate-500 text-sm mt-1">Wiki communautaire Star Citizen</p>
        </div>

        <div className="bg-space-900 border border-space-400/20 rounded-2xl overflow-hidden shadow-xl">
          {/* Tabs */}
          <div className="flex border-b border-space-400/20">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={clsx(
                  'flex-1 py-3.5 text-sm font-medium transition-colors',
                  tab === t
                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {t === 'login' ? 'Connexion' : 'Créer un compte'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {tab === 'register' && (
              <div>
                <label className={LABEL_CLASS}>Pseudo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="ton_pseudo"
                    required
                    maxLength={30}
                    className={clsx(INPUT_CLASS, 'pl-9')}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={LABEL_CLASS}>Adresse e-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  className={clsx(INPUT_CLASS, 'pl-9')}
                />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>Mot de passe {tab === 'register' && <span className="text-slate-600">(8 caractères min.)</span>}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={clsx(INPUT_CLASS, 'pl-9 pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-space-950 font-semibold text-sm transition-colors"
            >
              {submitting
                ? (tab === 'login' ? 'Connexion...' : 'Création...')
                : (tab === 'login' ? 'Se connecter' : 'Créer le compte')}
            </button>

            {tab === 'register' && (
              <p className="text-xs text-slate-500 text-center">
                Après inscription, un admin validera ton compte avant que tu puisses contribuer.
              </p>
            )}
          </form>
        </div>

        <div className="text-center mt-4">
          <Link to="/tableau-de-bord" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Continuer sans compte →
          </Link>
        </div>
      </div>
    </div>
  );
}
