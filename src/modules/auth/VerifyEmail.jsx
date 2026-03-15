import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';
import { MailCheck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('error');
      setMessage('Service d\'authentification non configuré.');
      return;
    }

    // Supabase gère le token hash automatiquement via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus('success');
      } else if (event === 'TOKEN_REFRESHED') {
        setStatus('success');
      }
    });

    // Si déjà connecté (hash déjà traité), vérifier la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success');
      } else {
        // Pas de session — le lien est peut-être invalide ou expiré
        setTimeout(() => {
          setStatus(s => s === 'loading' ? 'error' : s);
          setMessage('Le lien de vérification est invalide ou a expiré.');
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="card p-8 max-w-md w-full text-center space-y-5">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-cyan-400 mx-auto animate-spin" />
            <h1 className="text-xl font-bold text-slate-100">Vérification en cours…</h1>
            <p className="text-slate-400 text-sm">Validation de votre adresse e-mail.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <h1 className="text-xl font-bold text-slate-100">E-mail vérifié !</h1>
            <p className="text-slate-400 text-sm">
              Votre adresse e-mail a été confirmée avec succès.
              Votre compte est maintenant actif.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/tableau-de-bord')} className="btn-primary w-full">
                Accéder au tableau de bord
              </button>
              <button onClick={() => navigate('/profil')} className="btn-secondary w-full">
                Voir mon profil
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold text-slate-100">Lien invalide</h1>
            <p className="text-slate-400 text-sm">
              {message || 'Le lien de vérification est invalide ou a expiré.'}
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/connexion')} className="btn-primary w-full">
                Se connecter
              </button>
              <p className="text-xs text-slate-500">
                Connectez-vous et demandez un nouvel e-mail de vérification depuis votre profil.
              </p>
            </div>
          </>
        )}

        <div className="pt-2 border-t border-space-400/20">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <MailCheck className="w-3.5 h-3.5" />
            <span>SC Companion — Vérification d'e-mail</span>
          </div>
        </div>
      </div>
    </div>
  );
}
