import React from 'react';
import clsx from 'clsx';

export default function LoadingSpinner({ size = 'md', fullScreen = false, label = 'Chargement...' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={clsx(
          'rounded-full border-space-400 border-t-cyan-400 animate-spin',
          sizes[size]
        )}
        role="status"
        aria-label={label}
      />
      {label && <span className="text-slate-400 text-sm">{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-space-950/80 z-50">
        <div className="flex flex-col items-center gap-4">
          {/* SC-style logo animation */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50 animate-spin" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-4 rounded-full bg-cyan-500/10 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="text-cyan-400 font-display font-semibold tracking-wider">STAR CITIZEN COMPANION</div>
            <div className="text-slate-500 text-sm mt-1">Initialisation...</div>
          </div>
        </div>
      </div>
    );
  }

  return spinner;
}

export function SkeletonCard({ className }) {
  return (
    <div className={clsx('card p-4 space-y-3 animate-pulse', className)}>
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-3 border-b border-space-400/20">
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="skeleton h-3 w-20 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <div className="skeleton h-3 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
