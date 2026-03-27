import React from 'react';
import clsx from 'clsx';

/**
 * Badge visuel "Nouveau X.Y" ou "Modifié X.Y" à placer sur les items des modules.
 *
 * Usage:
 *   <PatchBadge type="added" version="4.7" />
 *   <PatchBadge type="changed" version="4.7" size="sm" />
 *
 * Ou via le hook :
 *   const { isNew, isChanged, version } = usePatchStatus('ships', shipId);
 *   {isNew && <PatchBadge type="added" version={version} />}
 *   {isChanged && <PatchBadge type="changed" version={version} />}
 */
export default function PatchBadge({ type = 'added', version, size = 'sm', className }) {
  if (!version) return null;

  const isNew = type === 'added';
  const label = isNew ? `Nouveau ${version}` : `MAJ ${version}`;

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-full whitespace-nowrap',
        size === 'sm' && 'text-[10px] px-1.5 py-0.5',
        size === 'md' && 'text-xs px-2 py-0.5',
        size === 'lg' && 'text-sm px-2.5 py-1',
        isNew
          ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
          : 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
        className,
      )}
    >
      <span className={clsx(
        'inline-block rounded-full mr-1',
        size === 'sm' && 'w-1.5 h-1.5',
        size === 'md' && 'w-2 h-2',
        size === 'lg' && 'w-2 h-2',
        isNew ? 'bg-emerald-400' : 'bg-amber-400',
      )} />
      {label}
    </span>
  );
}
