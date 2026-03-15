import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';

const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  footer,
  closable = true,
  className,
}) {
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape' && closable) onClose?.();
  }, [closable, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closable ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={clsx(
          'relative w-full z-10 card overflow-hidden flex flex-col max-h-[90vh] animate-scale-in',
          MODAL_SIZES[size],
          className
        )}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-space-400/20 flex-shrink-0">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-slate-100 font-display">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            {closable && (
              <button
                onClick={onClose}
                className="btn-ghost p-1.5 flex-shrink-0 -mt-0.5 -mr-0.5"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 scroll-container">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-space-400/20 flex-shrink-0 bg-space-900/40">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// Confirmation dialog
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer l\'action',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">{cancelLabel}</button>
          <button
            onClick={() => { onConfirm?.(); onClose?.(); }}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-slate-300">{message}</p>
    </Modal>
  );
}
