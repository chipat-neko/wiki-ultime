import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

/**
 * Badge indiquant si les données viennent d'une source live ou locale.
 *
 * @param {{ isLive: boolean, lastUpdated: number|null, loading?: boolean, className?: string }} props
 */
export default function DataBadge({ isLive, lastUpdated, loading = false, className }) {
  const age = lastUpdated ? Math.floor((Date.now() - lastUpdated) / 60000) : null;

  if (loading) {
    return (
      <span className={clsx('inline-flex items-center gap-1 text-xs text-slate-500', className)}>
        <RefreshCw className="w-3 h-3 animate-spin" />
        Chargement…
      </span>
    );
  }

  if (isLive) {
    return (
      <span className={clsx('inline-flex items-center gap-1 text-xs text-success-400', className)}>
        <Wifi className="w-3 h-3" />
        Live
        {age !== null && <span className="text-slate-500">• il y a {age === 0 ? '< 1' : age} min</span>}
      </span>
    );
  }

  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs text-slate-500', className)}>
      <WifiOff className="w-3 h-3" />
      Données locales
    </span>
  );
}
