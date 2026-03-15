import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MISSION_TYPES_DATA,
  MISSION_FACTIONS,
  SAMPLE_MISSIONS,
} from '../../datasets/missions.js';
import { formatCredits } from '../../utils/formatters.js';
import clsx from 'clsx';
import {
  ArrowLeft, Target, Clock, AlertTriangle, CheckCircle2,
  Shield, Package, Compass, Star, Layers, ChevronRight,
  TrendingUp, Users, BookOpen, Zap, Lock, Unlock,
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  Facile:         'badge-green',
  Moyen:          'badge-yellow',
  Difficile:      'badge-red',
  'Très Difficile': 'badge-red',
  Extrême:        'badge-red',
};

const CATEGORY_ICONS = {
  combat:      Target,
  transport:   Package,
  industrie:   Star,
  exploration: Compass,
  service:     Shield,
  criminel:    AlertTriangle,
};

const DIFFICULTY_ORDER = ['Facile', 'Moyen', 'Difficile', 'Très Difficile', 'Extrême'];

function PayoutBar({ min, max }) {
  const avg = Math.round((min + max) / 2);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Min : <span className="text-success-400 font-semibold">{formatCredits(min, true)}</span></span>
        <span>Moy : <span className="text-gold-400 font-bold">{formatCredits(avg, true)}</span></span>
        <span>Max : <span className="text-cyan-400 font-semibold">{formatCredits(max, true)}</span></span>
      </div>
      <div className="h-3 bg-space-600 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-success-500/40 via-gold-500/60 to-cyan-500/80 rounded-full" />
        <div
          className="absolute inset-y-0 left-1/2 w-0.5 bg-gold-400 rounded-full"
          style={{ transform: 'translateX(-50%)' }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = 'text-cyan-400' }) {
  return (
    <div className="card p-4 text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
      <div className={`text-lg font-bold font-display ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function SampleMissionCard({ mission }) {
  const isExpired = mission.expires && mission.expires < Date.now();
  return (
    <div className={clsx(
      'p-3 rounded-lg border border-space-400/20 bg-space-800/40',
      isExpired && 'opacity-40'
    )}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-200 truncate">{mission.name}</span>
        <span className="text-sm font-bold text-success-400 flex-shrink-0">{formatCredits(mission.payout, true)}</span>
      </div>
      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />{mission.estimatedTime} min
        </span>
        {mission.location && <span className="truncate max-w-[120px]">{mission.location}</span>}
        {isExpired && <span className="text-danger-400">Expirée</span>}
      </div>
    </div>
  );
}

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const mission = MISSION_TYPES_DATA.find(m => m.id === id);

  const relatedMissions = useMemo(() => {
    if (!mission) return [];
    return MISSION_TYPES_DATA
      .filter(m => m.id !== id && m.category === mission.category)
      .slice(0, 4);
  }, [mission, id]);

  const sampleInstances = useMemo(() => {
    if (!mission) return [];
    return SAMPLE_MISSIONS.filter(s => s.typeId === id).slice(0, 6);
  }, [mission, id]);

  const factionObjs = useMemo(() => {
    if (!mission) return [];
    return (mission.factions || [])
      .map(fid => MISSION_FACTIONS.find(f => f.id === fid))
      .filter(Boolean);
  }, [mission]);

  const avgPayout = mission ? Math.round((mission.payout.min + mission.payout.max) / 2) : 0;
  const payoutPerHour = mission ? Math.round((avgPayout / mission.estimatedTime) * 60) : 0;

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Target className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">Mission introuvable.</p>
        <button onClick={() => navigate('/missions')} className="btn-primary">
          Retour aux Missions
        </button>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[mission.category] || Target;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/missions')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au Planificateur
      </button>

      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-4 rounded-xl bg-space-700/60 border border-space-400/20 flex-shrink-0">
            <Icon className="w-10 h-10 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="page-title mb-0">{mission.name}</h1>
              <span className={`badge ${DIFFICULTY_COLORS[mission.difficulty]}`}>{mission.difficulty}</span>
              <span className={`badge ${mission.legal ? 'badge-green' : 'badge-red'}`}>
                {mission.legal ? <><Unlock className="w-3 h-3 mr-1 inline" />Légal</> : <><Lock className="w-3 h-3 mr-1 inline" />Illégal</>}
              </span>
              {mission.stackable && <span className="badge badge-cyan"><Layers className="w-3 h-3 mr-1 inline" />Empilement</span>}
              {mission.reputation > 0 && (
                <span className="badge badge-purple">Rép. {mission.reputation}+</span>
              )}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{mission.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="badge badge-slate">{mission.type}</span>
              <span className="capitalize text-slate-400">{mission.category}</span>
              {mission.requiredShip?.minCargo > 0 && (
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />Cargo min : {mission.requiredShip.minCargo} SCU
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp}  label="Prime Moyenne"  value={formatCredits(avgPayout, true)}      color="text-success-400" />
        <StatCard icon={Clock}       label="Durée Estimée"  value={`${mission.estimatedTime} min`}      color="text-cyan-400"    />
        <StatCard icon={Zap}         label="Prime/Heure"    value={formatCredits(payoutPerHour, true)}  color="text-gold-400"    />
        <StatCard icon={Users}       label="Factions"       value={factionObjs.length}                  color="text-purple-400"  />
      </div>

      {/* Payout range */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Fourchette de Prime</h2>
        <PayoutBar min={mission.payout.min} max={mission.payout.max} />
        <p className="text-xs text-slate-500 mt-3">
          La prime varie selon la difficulté effective de la mission, votre niveau de réputation avec la faction donneuse et la distance de livraison.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objectives + Risks + Tips */}
        <div className="space-y-4">
          {mission.objectives?.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-400" />
                Objectifs
              </h2>
              <ul className="space-y-2">
                {mission.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-success-500/20 border border-success-500/30 flex items-center justify-center text-xs text-success-400 flex-shrink-0 mt-0.5 font-bold">
                      {i + 1}
                    </div>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mission.risks?.length > 0 && (
            <div className="card p-5 border-danger-500/10">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger-400" />
                Risques
              </h2>
              <ul className="space-y-2">
                {mission.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-danger-400 flex-shrink-0 mt-2" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mission.tips && (
            <div className="card p-5 border-cyan-500/10 bg-cyan-500/5">
              <h2 className="section-title mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Conseil Pro
              </h2>
              <p className="text-sm text-slate-300">{mission.tips}</p>
            </div>
          )}
        </div>

        {/* Factions + Givers */}
        <div className="space-y-4">
          {factionObjs.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Factions Disponibles
              </h2>
              <div className="space-y-2">
                {factionObjs.map(f => (
                  <div
                    key={f.id}
                    className={clsx(
                      'flex items-center justify-between p-3 rounded-lg',
                      f.legal ? 'bg-blue-500/5 border border-blue-500/15' : 'bg-red-500/5 border border-red-500/15'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${f.legal ? 'bg-blue-400' : 'bg-red-400'}`} />
                      <span className={`text-sm font-medium ${f.legal ? 'text-blue-300' : 'text-red-300'}`}>
                        {f.label}
                      </span>
                    </div>
                    {f.minReputation > 0 && (
                      <span className="badge badge-purple text-xs">Rép. {f.minReputation}+</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {mission.givers?.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                Donneurs de Mission
              </h2>
              <div className="flex flex-wrap gap-2">
                {mission.givers.map((g, i) => (
                  <span key={i} className="badge badge-slate">{g}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sample instances */}
      {sampleInstances.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Exemples de Missions Actives</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sampleInstances.map(m => (
              <SampleMissionCard key={m.id} mission={m} />
            ))}
          </div>
        </div>
      )}

      {/* Related missions */}
      {relatedMissions.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Missions Similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedMissions.map(m => {
              const RelIcon = CATEGORY_ICONS[m.category] || Target;
              return (
                <Link
                  key={m.id}
                  to={`/missions/${m.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-space-400/20 hover:border-cyan-500/30 hover:bg-space-700/40 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-space-700/60 flex-shrink-0">
                    <RelIcon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{m.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge ${DIFFICULTY_COLORS[m.difficulty]} text-xs`}>{m.difficulty}</span>
                      <span className="text-xs text-success-400">{formatCredits(Math.round((m.payout.min + m.payout.max) / 2), true)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
