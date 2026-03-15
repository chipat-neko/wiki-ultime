import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { sortBy, paginate } from '../../utils/helpers.js';
import Pagination from './Pagination.jsx';

/**
 * DataTable - Tableau de données avec tri, pagination et recherche
 */
export default function DataTable({
  data = [],
  columns = [],
  keyField = 'id',
  defaultSort = null,
  defaultSortDir = 'asc',
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  onRowClick,
  selectedRow,
  emptyMessage = 'Aucune donnée disponible',
  loading = false,
  stickyHeader = false,
  className,
  rowClassName,
  compact = false,
}) {
  const [sortKey, setSortKey] = useState(defaultSort);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find(c => (c.sortKey || c.key) === sortKey);
    if (col?.sortFn) {
      return [...data].sort((a, b) => {
        const result = col.sortFn(a, b);
        return sortDir === 'asc' ? result : -result;
      });
    }
    return sortBy(data, sortKey, sortDir);
  }, [data, sortKey, sortDir, columns]);

  const paginated = useMemo(
    () => paginate(sortedData, currentPage, currentPageSize),
    [sortedData, currentPage, currentPageSize]
  );

  const SortIcon = ({ colKey }) => {
    const sk = colKey;
    if (sortKey !== sk) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
      : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />;
  };

  if (loading) {
    return (
      <div className={clsx('card overflow-hidden', className)}>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-8 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('card overflow-hidden flex flex-col', className)}>
      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="data-table min-w-full">
          <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
            <tr>
              {columns.map((col) => {
                const sk = col.sortKey || col.key;
                return (
                  <th
                    key={col.key}
                    className={clsx(
                      col.sortable !== false && sk ? 'cursor-pointer select-none hover:bg-space-800' : '',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '',
                      col.width ? `w-${col.width}` : '',
                      compact ? 'py-2' : ''
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable !== false && sk && handleSort(sk)}
                  >
                    <div className={clsx(
                      'flex items-center gap-1',
                      col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''
                    )}>
                      {col.label}
                      {col.sortable !== false && sk && <SortIcon colKey={sk} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginated.items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.items.map((row, idx) => (
                <tr
                  key={row[keyField] || idx}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    onRowClick && 'cursor-pointer',
                    selectedRow === row[keyField] && 'bg-cyan-500/10 border-l-2 border-cyan-500',
                    compact ? '' : '',
                    typeof rowClassName === 'function' ? rowClassName(row) : rowClassName
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : '',
                        compact ? 'py-1.5' : ''
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row, idx)
                        : col.format
                        ? col.format(row[col.key])
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated.total > currentPageSize && (
        <div className="border-t border-space-400/20 flex-shrink-0">
          <Pagination
            currentPage={paginated.page}
            totalPages={paginated.pages}
            totalItems={paginated.total}
            pageSize={currentPageSize}
            pageSizeOptions={pageSizeOptions}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setCurrentPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
