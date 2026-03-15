import React from 'react';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * InfoCard - Carte d'information avec icône, valeur et tendance
 */
export default function InfoCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-cyan-400',
  iconBg = 'bg-cyan-500/10',
  trend,
  trendLabel,
  badge,
  badgeVariant = 'cyan',
  onClick,
  className,
  variant = 'default', // 'default' | 'accent' | 'warning' | 'danger' | 'success'
}) {
  const variants = {
    default: 'card',
    accent: 'card border-cyan-500/30 bg-cyan-500/5',
    warning: 'card border-warning-500/30 bg-warning-500/5',
    danger: 'card border-danger-500/30 bg-danger-500/5',
    success: 'card border-success-500/30 bg-success-500/5',
  };

  const trendIsPositive = trend > 0;
  const trendIsNeutral = trend === 0;

  return (
    <div
      className={clsx(
        variants[variant],
        'p-4 flex items-start gap-4',
        onClick && 'cursor-pointer hover:border-cyan-500/30 transition-all',
        'animate-fade-in',
        className
      )}
      onClick={onClick}
    >
      {/* Icon */}
      {Icon && (
        <div className={clsx('p-2.5 rounded-lg flex-shrink-0', iconBg)}>
          <Icon className={clsx('w-5 h-5', iconColor)} />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium truncate">{title}</p>
            <p className={clsx(
              'mt-1 font-bold font-display truncate',
              variant === 'default' ? 'text-xl text-slate-100' : 'text-xl',
              variant === 'accent' && 'text-cyan-400',
              variant === 'warning' && 'text-warning-400',
              variant === 'danger' && 'text-danger-400',
              variant === 'success' && 'text-success-400',
            )}>
              {value}
            </p>
          </div>

          {/* Badge */}
          {badge && (
            <span className={`badge badge-${badgeVariant} flex-shrink-0`}>{badge}</span>
          )}
        </div>

        {/* Subtitle or trend */}
        <div className="mt-1 flex items-center gap-2">
          {trend !== undefined && (
            <div className={clsx(
              'flex items-center gap-0.5 text-xs font-medium',
              trendIsNeutral ? 'text-slate-500' : trendIsPositive ? 'text-success-400' : 'text-danger-400'
            )}>
              {trendIsNeutral ? (
                <Minus className="w-3 h-3" />
              ) : trendIsPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          )}
          {trendLabel && (
            <p className="text-xs text-slate-500">{trendLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * StatWidget - Widget statistique compact pour les grilles
 */
export function StatWidget({ label, value, unit, color = 'text-cyan-400', size = 'md' }) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={clsx('font-bold font-display', color, textSizes[size])}>{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}
