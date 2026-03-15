import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppActions, useFavorites } from '../../core/StateManager.jsx';
import { useShipImages } from '../../core/ShipImagesContext.jsx';
import { resolveShipImage } from '../../services/ShipImageService.js';
import { SHIPS_BY_ID } from '../../datasets/ships.js';
import { getBuyLocations, isPledgeOnly } from '../../datasets/buyLocations.js';
import { formatCredits, formatCargo, formatSpeed, formatNumber } from '../../utils/formatters.js';
import { StatWidget } from '../../ui/components/InfoCard.jsx';
import { useFleetyardsShip } from '../../hooks/useFleetyardsShip.js';
import { useErkulShip } from '../../hooks/useErkulShip.js';
import clsx from 'clsx';
import {
  ArrowLeft, Star, Plus, ExternalLink, Rocket, Shield,
  Zap, Package, Users, Target, ChevronRight, Info, MapPin, ShoppingCart, GitCompare,
  RefreshCw, Database, Gauge,
} from 'lucide-react';

function SpecBar({ label, value, max, unit, color = 'bg-cyan-500' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-24 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-space-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-300 w-16 flex-shrink-0">{value} {unit}</span>
    </div>
  );
}

// ─── Panel données live (Fleetyards + Erkul) ──────────────────────────────────
function LiveDataPanel({ shipName }) {
  const [enabled, setEnabled] = useState(false);
  const { data: fy, loading: fyLoading, error: fyError } = useFleetyardsShip(shipName, enabled);
  const { data: erkul, loading: erkulLoading, error: erkulError } = useErkulShip(shipName, enabled);

  const loading = fyLoading || erkulLoading;

  return (
    <div className="card p-5" style={{ borderColor: '#06b6d420' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Données Live
        </h2>
        {!enabled ? (
          <button
            onClick={() => setEnabled(true)}
            className="btn-secondary btn-sm gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Charger (Fleetyards + Erkul)
          </button>
        ) : loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Chargement…
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            {fy && <span className="text-cyan-400">Fleetyards ✓</span>}
            {erkul && <span className="text-green-400 ml-1">Erkul ✓</span>}
          </div>
        )}
      </div>

      {!enabled && (
        <p className="text-xs text-slate-500">
          Specs enrichies depuis <span className="text-cyan-400">Fleetyards.net</span> et stats de combat depuis <span className="text-green-400">Erkul Games</span> — chargement à la demande.
        </p>
      )}

      {enabled && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── Fleetyards ── */}
          <div>
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              Fleetyards.net
            </h3>
            {fyError ? (
              <p className="text-xs text-slate-500 italic">{fyError}</p>
            ) : fy ? (
              <div className="space-y-3">
                {fy.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">{fy.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {fy.mass && (
                    <div className="p-2 rounded-lg bg-space-900/60">
                      <div className="text-sm font-semibold text-slate-200">{formatNumber(fy.mass)} kg</div>
                      <div className="text-xs text-slate-600 mt-0.5">Masse</div>
                    </div>
                  )}
                  {fy.speed?.scm && (
                    <div className="p-2 rounded-lg bg-space-900/60">
                      <div className="text-sm font-semibold text-cyan-400">{fy.speed.scm} m/s</div>
                      <div className="text-xs text-slate-600 mt-0.5">SCM (Fleetyards)</div>
                    </div>
                  )}
                  {fy.speed?.afterburner && (
                    <div className="p-2 rounded-lg bg-space-900/60">
                      <div className="text-sm font-semibold text-blue-400">{fy.speed.afterburner} m/s</div>
                      <div className="text-xs text-slate-600 mt-0.5">Afterburner</div>
                    </div>
                  )}
                  {fy.cargo != null && (
                    <div className="p-2 rounded-lg bg-space-900/60">
                      <div className="text-sm font-semibold text-green-400">{fy.cargo} SCU</div>
                      <div className="text-xs text-slate-600 mt-0.5">Cargo (Fleetyards)</div>
                    </div>
                  )}
                </div>
                {fy.updatedAt && (
                  <p className="text-xs text-slate-600">
                    Mis à jour : {new Date(fy.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {fy.fleetchartImage && (
                  <a
                    href={fy.fleetchartImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Voir le fleetchart
                  </a>
                )}
              </div>
            ) : null}
          </div>

          {/* ── Erkul ── */}
          <div>
            <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Erkul Games
            </h3>
            {erkulError ? (
              <p className="text-xs text-slate-500 italic">{erkulError}</p>
            ) : erkul ? (
              <div className="grid grid-cols-2 gap-2">
                {erkul.shield > 0 && (
                  <div className="p-2 rounded-lg bg-space-900/60">
                    <div className="text-sm font-semibold text-cyan-400">{formatNumber(erkul.shield)} HP</div>
                    <div className="text-xs text-slate-600 mt-0.5">Boucliers (Erkul)</div>
                  </div>
                )}
                {erkul.hull > 0 && (
                  <div className="p-2 rounded-lg bg-space-900/60">
                    <div className="text-sm font-semibold text-orange-400">{formatNumber(erkul.hull)} HP</div>
                    <div className="text-xs text-slate-600 mt-0.5">Coque (Erkul)</div>
                  </div>
                )}
                {erkul.speed?.scm > 0 && (
                  <div className="p-2 rounded-lg bg-space-900/60">
                    <div className="text-sm font-semibold text-blue-400">{erkul.speed.scm} m/s</div>
                    <div className="text-xs text-slate-600 mt-0.5">SCM (Erkul)</div>
                  </div>
                )}
                {erkul.speed?.afterburner > 0 && (
                  <div className="p-2 rounded-lg bg-space-900/60">
                    <div className="text-sm font-semibold text-purple-400">{erkul.speed.afterburner} m/s</div>
                    <div className="text-xs text-slate-600 mt-0.5">Afterburner (Erkul)</div>
                  </div>
                )}
                {erkul.speed?.quantum > 0 && (
                  <div className="p-2 rounded-lg bg-space-900/60">
                    <div className="text-sm font-semibold text-gold-400">{formatNumber(erkul.speed.quantum)} m/s</div>
                    <div className="text-xs text-slate-600 mt-0.5">Quantum (Erkul)</div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addShipToFleet, notify } = useAppActions();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const ship = SHIPS_BY_ID[id];
  const isFavorite = (favorites.ships || []).some(f => f.id === id);
  const [imgError, setImgError] = useState(false);
  const apiImages = useShipImages();
  const heroImageUrl = ship ? resolveShipImage(ship.name, ship.imageUrl, apiImages) : null;

  if (!ship) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Rocket className="w-16 h-16 text-slate-600" />
        <h2 className="text-xl font-bold text-slate-400">Vaisseau introuvable</h2>
        <button onClick={() => navigate('/vaisseaux')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Retour aux vaisseaux
        </button>
      </div>
    );
  }

  const handleAddToFleet = () => {
    addShipToFleet({
      fleetId: `fleet_${ship.id}_${Date.now()}`,
      shipId: ship.id,
      name: ship.name,
      manufacturer: ship.manufacturer,
      role: ship.role,
      size: ship.size,
      specs: ship.specs,
      price: ship.price,
    });
    notify(`${ship.name} ajouté à votre flotte !`, 'success');
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite('ships', { id: ship.id });
      notify(`${ship.name} retiré des favoris`, 'info');
    } else {
      addFavorite('ships', { id: ship.id, name: ship.name, manufacturer: ship.manufacturer });
      notify(`${ship.name} ajouté aux favoris !`, 'success');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/vaisseaux')} className="btn-ghost btn-sm gap-2">
        <ArrowLeft className="w-4 h-4" />
        Base de Données
      </button>

      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="relative h-72 bg-gradient-to-br from-space-800 via-space-700 to-space-900 flex items-center justify-center">
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />
          <div className="absolute inset-0 bg-glow-cyan opacity-10" />
          {heroImageUrl && !imgError ? (
            <img
              src={heroImageUrl}
              alt={ship.name}
              className="absolute inset-0 w-full h-full object-contain p-4 opacity-90 z-10"
              onError={() => setImgError(true)}
            />
          ) : (
            <Rocket className="w-32 h-32 text-space-600 relative z-10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-space-900/70 via-transparent to-transparent z-10" />
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <span className={`badge ${ship.inGame ? 'badge-green' : 'badge-yellow'}`}>
              {ship.inGame ? 'En Jeu' : 'Prévu'}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">{ship.manufacturer}</p>
              <h1 className="text-3xl font-bold font-display text-white mt-1">{ship.name}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="badge badge-cyan">{ship.role}</span>
                <span className={clsx('badge', {
                  'badge-cyan': ship.size === 'Petit',
                  'badge-green': ship.size === 'Moyen',
                  'badge-purple': ship.size === 'Grand',
                  'badge-slate': ship.size === 'Nain',
                  'badge-red': ship.size === 'Capital',
                })}>
                  {ship.size}
                </span>
                {ship.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="badge badge-slate">{tag}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handleToggleFavorite} className={clsx(
                'btn-secondary gap-2',
                isFavorite && 'border-gold-500/30 text-gold-400'
              )}>
                <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'Favori' : 'Ajouter aux Favoris'}
              </button>
              <button onClick={handleAddToFleet} className="btn-primary gap-2">
                <Plus className="w-4 h-4" />
                Ajouter à la Flotte
              </button>
              <button
                onClick={() => navigate(`/vaisseaux/comparer?a=${id}`)}
                className="btn-secondary gap-2"
                title="Comparer avec d'autres vaisseaux"
              >
                <GitCompare className="w-4 h-4" />
                Comparer
              </button>
            </div>
          </div>

          {ship.description && (
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">{ship.description}</p>
          )}
        </div>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance */}
        <div className="card p-5">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Performances de Vol
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <StatWidget label="Vitesse Max" value={formatNumber(ship.specs?.maxSpeed)} unit="m/s" color="text-cyan-400" />
            <StatWidget label="Vitesse SCM" value={formatNumber(ship.specs?.scmSpeed)} unit="m/s" color="text-blue-400" />
            <StatWidget label="Accélération" value={ship.specs?.acceleration?.toFixed(1) ?? '—'} unit="m/s²" color="text-purple-400" />
            <StatWidget label="Carburant H₂" value={formatNumber(ship.specs?.fuel)} unit="L" color="text-green-400" />
          </div>
          <div className="space-y-2">
            <SpecBar label="Vitesse Max" value={ship.specs?.maxSpeed || 0} max={1500} unit="m/s" color="bg-cyan-500" />
            <SpecBar label="Vitesse SCM" value={ship.specs?.scmSpeed || 0} max={300} unit="m/s" color="bg-blue-500" />
            <SpecBar label="Accélération" value={ship.specs?.acceleration || 0} max={100} unit="m/s²" color="bg-purple-500" />
          </div>
        </div>

        {/* Combat & Défense */}
        <div className="card p-5">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Combat & Défense
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
            <StatWidget label="Boucliers HP" value={formatNumber(ship.specs?.shieldHp)} unit="HP" color="text-cyan-400" />
            <StatWidget label="Équipage Min" value={ship.crew?.min ?? ship.specs?.crew?.min ?? 1} unit="pilotes" color="text-orange-400" />
            <StatWidget label="Équipage Max" value={ship.crew?.max ?? ship.specs?.crew?.max ?? 1} unit="pilotes" color="text-yellow-400" />
            <StatWidget label="Carburant QT" value={formatNumber(ship.specs?.qFuel)} unit="L" color="text-blue-400" />
          </div>

          {/* Hardpoints */}
          {ship.hardpoints && (
            <div className="space-y-3">
              {ship.hardpoints.weapons?.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Armes</div>
                  <div className="flex flex-wrap gap-1">
                    {ship.hardpoints.weapons.map((w, i) => (
                      <span key={i} className="badge badge-red">{w}</span>
                    ))}
                  </div>
                </div>
              )}
              {ship.hardpoints.missiles?.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Missiles</div>
                  <div className="flex flex-wrap gap-1">
                    {ship.hardpoints.missiles.map((m, i) => (
                      <span key={i} className="badge badge-yellow">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {ship.hardpoints.turrets?.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Tourelles</div>
                  <div className="flex flex-wrap gap-1">
                    {ship.hardpoints.turrets.map((t, i) => (
                      <span key={i} className="badge badge-purple">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cargo & Transport */}
        <div className="card p-5">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            Cargo & Transport
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <StatWidget
              label="Cargo"
              value={ship.specs?.cargo > 0 ? formatNumber(ship.specs.cargo) : 'Aucun'}
              unit={ship.specs?.cargo > 0 ? 'SCU' : ''}
              color={ship.specs?.cargo > 0 ? 'text-green-400' : 'text-slate-600'}
            />
            <StatWidget label="Prix aUEC" value={formatCredits(ship.price, true)} color="text-gold-400" />
            <StatWidget label="Prix Pledge" value={`$${ship.pledgePrice}`} unit="USD" color="text-gold-400" />
            <StatWidget
              label="Statut"
              value={ship.inGame ? 'En Jeu' : 'Prévu'}
              color={ship.inGame ? 'text-success-400' : 'text-warning-400'}
            />
          </div>
        </div>

        {/* Variantes */}
        <div className="card p-5">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Variantes & Infos
          </h2>
          {ship.variants?.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Variantes disponibles</p>
              {ship.variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-space-900/50">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-sm text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Aucune variante connue</p>
          )}

          {ship.wikiUrl && (
            <a
              href={ship.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-sm gap-2 mt-4 w-full justify-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Voir sur Star Citizen Wiki
            </a>
          )}
        </div>
      </div>

      {/* Données Live Fleetyards + Erkul */}
      <LiveDataPanel shipName={ship.name} />

      {/* Où Acheter */}
      <BuyLocationsPanel shipId={ship.id} inGame={ship.inGame} pledgePrice={ship.pledgePrice} />
    </div>
  );
}

function BuyLocationsPanel({ shipId, inGame, pledgePrice }) {
  const locations = getBuyLocations(shipId);
  const pledgeOnly = isPledgeOnly(shipId);

  return (
    <div className="card p-5">
      <h2 className="section-title mb-5 flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 text-cyan-400" />
        Où Acheter
      </h2>

      {!inGame ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-space-900/50 border border-yellow-700/30">
          <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">Pas encore en jeu</p>
            <p className="text-xs text-slate-400 mt-1">
              Ce vaisseau n'est pas encore disponible en jeu. Il peut être acquis via pledge sur{' '}
              <span className="text-cyan-400">robertsspaceindustries.com</span>
              {pledgePrice > 0 && <span className="text-gold-400 font-semibold"> (${pledgePrice} USD)</span>}.
            </p>
          </div>
        </div>
      ) : pledgeOnly ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-space-900/50 border border-orange-700/30">
          <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-300">Disponible uniquement par pledge</p>
            <p className="text-xs text-slate-400 mt-1">
              Ce vaisseau est en jeu mais ne peut être obtenu que via pledge RSI ou événements spéciaux.
              {pledgePrice > 0 && <span className="text-gold-400 font-semibold"> Prix pledge: ${pledgePrice} USD</span>}.
            </p>
          </div>
        </div>
      ) : locations.length === 0 ? (
        <p className="text-slate-500 text-sm">Aucun lieu d'achat connu pour l'instant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {locations.map(dealer => (
            <div
              key={dealer.id}
              className={clsx(
                'rounded-xl border p-4 flex flex-col gap-2',
                dealer.bg, dealer.border
              )}
            >
              <div className="flex items-center justify-between">
                <span className={clsx('text-sm font-bold', dealer.color)}>{dealer.name}</span>
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full font-medium border',
                  dealer.legal
                    ? 'text-green-400 border-green-700/40 bg-green-900/30'
                    : 'text-red-400 border-red-700/40 bg-red-900/30'
                )}>
                  {dealer.legal ? 'Légal' : 'Illégal'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span>{dealer.location}</span>
              </div>
              <div className="text-xs text-slate-500">
                <span className="text-slate-400">{dealer.body}</span>
                <span className="text-slate-600 mx-1">·</span>
                <span>{dealer.system}</span>
              </div>
              <div className="text-xs text-slate-600 font-medium uppercase tracking-wide mt-1">
                {dealer.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
