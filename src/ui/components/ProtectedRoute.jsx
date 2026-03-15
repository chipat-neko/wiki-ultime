import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Protège une route selon le niveau d'accès requis.
 * @param {'auth'|'active'|'mod'|'admin'} require
 *   - 'auth'   → connecté (même en attente)
 *   - 'active' → compte approuvé
 *   - 'mod'    → modérateur ou admin
 *   - 'admin'  → admin uniquement
 */
export default function ProtectedRoute({ children, require: level = 'active' }) {
  const { user, isActive, isMod, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!user) return <Navigate to="/connexion" state={{ from: location }} replace />;

  // 'active' : le compte doit être explicitement approuvé (status === 'active')
  // Un admin non encore approuvé ne peut pas bypasser — le statut est la source de vérité
  if (level === 'active' && !isActive) return <Navigate to="/profil"          replace />;
  if (level === 'mod'    && !isMod)    return <Navigate to="/tableau-de-bord" replace />;
  if (level === 'admin'  && !isAdmin)  return <Navigate to="/tableau-de-bord" replace />;

  return children;
}
