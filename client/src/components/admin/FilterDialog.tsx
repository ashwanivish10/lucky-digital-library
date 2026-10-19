import React from 'react';
import { createPortal } from 'react-dom';
import { Filter, X } from 'lucide-react';

interface FilterDialogProps {
  open: boolean;
  title?: string;
  activeCount?: number;
  onOpen: () => void;
  onClose: () => void;
  onApply: () => void;
  onClear?: () => void;
  children: React.ReactNode;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  title = 'Filters',
  activeCount = 0,
  onOpen,
  onClose,
  onApply,
  onClear,
  children,
}) => (
  <>
    <button
      type="button"
      onClick={onOpen}
      aria-label={activeCount > 0 ? `Filters, ${activeCount} active` : 'Filters'}
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e8dcc8] bg-white text-[#2c1f0e] md:hidden"
    >
      <Filter size={18} />
      {activeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a38b52] px-1 text-[10px] font-bold text-white">
          {activeCount}
        </span>
      )}
    </button>

    {open && createPortal(
      <div className="fixed inset-0 z-[80] flex items-end bg-black/50 md:hidden">
        <button type="button" aria-label="Close filters" className="absolute inset-0" onClick={onClose} />
        <div className="relative z-10 max-h-[85dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#2c1f0e]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#8a7a60]"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">{children}</div>
          <div className="mt-5 flex gap-2">
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="flex-1 rounded-xl border border-[#e8dcc8] bg-white px-4 py-3 text-sm font-semibold text-[#8B1A1A]"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onApply}
              className="flex-1 rounded-xl bg-[#2c1f0e] px-4 py-3 text-sm font-semibold text-white"
            >
              Apply
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )}
  </>
);

export default FilterDialog;
