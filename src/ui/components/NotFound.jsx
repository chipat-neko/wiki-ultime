import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="relative mb-8">
        <div className="text-9xl font-black font-display text-space-600 select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xl font-bold text-cyan-400 font-display">SECTEUR INCONNU</div>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-slate-200 mb-2">Page Introuvable</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        Cette coordonnée n'existe pas dans nos cartes stellaires. Le secteur est peut-être inexploré ou hors de portée.
      </p>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button onClick={() => navigate('/tableau-de-bord')} className="btn-primary gap-2">
          <Home className="w-4 h-4" />
          Tableau de Bord
        </button>
      </div>
    </div>
  );
}
