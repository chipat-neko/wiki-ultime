import React from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { range } from '../../utils/helpers.js';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  compact = false,
}) {
  const getPageNumbers = () => {
    if (totalPages <= 7) return range(1, totalPages);
    if (currentPage <= 4) return [...range(1, 5), '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', ...range(totalPages - 4, totalPages)];
    return [1, '...', ...range(currentPage - 1, currentPage + 1), '...', totalPages];
  };

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={clsx(
      'flex items-center justify-between px-4 py-3',
      compact ? 'flex-col gap-2' : 'flex-col sm:flex-row gap-3'
    )}>
      {/* Info */}
      <div className="text-xs text-slate-500">
        {totalItems > 0 ? (
          <>Affichage de <span className="text-slate-300">{from}</span> à <span className="text-slate-300">{to}</span> sur <span className="text-slate-300">{totalItems}</span> entrées</>
        ) : (
          'Aucune entrée'
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Page size selector */}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Lignes:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="select py-1 px-2 text-xs w-auto min-w-[60px]"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-space-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Première page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-space-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Page précédente"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-slate-600 text-xs">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={clsx(
                  'w-7 h-7 rounded text-xs font-medium transition-colors',
                  page === currentPage
                    ? 'bg-cyan-600/80 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-700'
                )}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-space-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Page suivante"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-space-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Dernière page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
