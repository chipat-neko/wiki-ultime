import React, { useState } from 'react';
import clsx from 'clsx';
import { Filter, ChevronDown, X, RotateCcw } from 'lucide-react';

/**
 * FilterPanel - Panneau de filtres avec support de plusieurs types
 */
export default function FilterPanel({
  filters = [],
  values = {},
  onChange,
  onReset,
  activeCount = 0,
  className,
  collapsible = true,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (key, value) => {
    onChange({ ...values, [key]: value });
  };

  const renderFilter = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={values[filter.key] || ''}
            onChange={(e) => handleChange(filter.key, e.target.value || null)}
            className="select text-sm"
          >
            <option value="">{filter.placeholder || 'Tous'}</option>
            {filter.options.map((opt) => (
              <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
        );

      case 'multi-select':
        return (
          <div className="flex flex-wrap gap-1">
            {filter.options.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              const selected = (values[filter.key] || []).includes(val);
              return (
                <button
                  key={val}
                  onClick={() => {
                    const current = values[filter.key] || [];
                    handleChange(
                      filter.key,
                      selected ? current.filter(v => v !== val) : [...current, val]
                    );
                  }}
                  className={clsx(
                    'badge cursor-pointer transition-all',
                    selected ? 'badge-cyan' : 'badge-slate hover:border-slate-400'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        );

      case 'range':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={filter.minLabel || 'Min'}
              value={values[filter.key]?.min || ''}
              onChange={(e) => handleChange(filter.key, {
                ...values[filter.key],
                min: e.target.value ? Number(e.target.value) : null,
              })}
              className="input text-sm"
              min={filter.min}
              max={filter.max}
            />
            <span className="text-slate-500 text-sm">—</span>
            <input
              type="number"
              placeholder={filter.maxLabel || 'Max'}
              value={values[filter.key]?.max || ''}
              onChange={(e) => handleChange(filter.key, {
                ...values[filter.key],
                max: e.target.value ? Number(e.target.value) : null,
              })}
              className="input text-sm"
              min={filter.min}
              max={filter.max}
            />
          </div>
        );

      case 'toggle':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={!!values[filter.key]}
                onChange={(e) => handleChange(filter.key, e.target.checked || null)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-space-500 peer-checked:bg-cyan-600 rounded-full transition-colors border border-space-400/40" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-slate-400">{filter.toggleLabel || 'Activer'}</span>
          </label>
        );

      case 'search':
        return (
          <div className="relative">
            <input
              type="text"
              value={values[filter.key] || ''}
              onChange={(e) => handleChange(filter.key, e.target.value || null)}
              placeholder={filter.placeholder || 'Filtrer...'}
              className="input text-sm pr-8"
            />
            {values[filter.key] && (
              <button
                onClick={() => handleChange(filter.key, null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx('card', className)}>
      {/* Header */}
      <div
        className={clsx(
          'flex items-center justify-between p-4',
          collapsible && 'cursor-pointer',
          isOpen && 'border-b border-space-400/20'
        )}
        onClick={collapsible ? () => setIsOpen(v => !v) : undefined}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-200">Filtres</span>
          {activeCount > 0 && (
            <span className="badge badge-cyan">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onReset?.(); }}
              className="btn-ghost p-1 text-xs gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          )}
          {collapsible && (
            <ChevronDown
              className={clsx('w-4 h-4 text-slate-500 transition-transform', isOpen && 'rotate-180')}
            />
          )}
        </div>
      </div>

      {/* Filters */}
      {isOpen && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {filter.label}
              </label>
              {renderFilter(filter)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
