import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Columns3 } from 'lucide-react';

export interface ColumnDef {
  id: string;
  label: string;
}

export function useColumnVisibility(storageKey: string, columns: ColumnDef[]) {
  const [hidden, setHidden] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(saved)) return [];
      const allowed = new Set(columns.map((column) => column.id));
      return saved.filter((id): id is string => typeof id === 'string' && allowed.has(id));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(hidden));
  }, [storageKey, hidden]);

  const visible = (id: string) => !hidden.includes(id);
  const shownCount = columns.filter((column) => !hidden.includes(column.id)).length;

  const toggle = (id: string) => {
    setHidden((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (columns.length - current.length <= 1) return current;
      return [...current, id];
    });
  };

  return { columns, visible, toggle, shownCount };
}

interface ColumnPickerProps {
  columns: ColumnDef[];
  visible: (id: string) => boolean;
  onToggle: (id: string) => void;
}

export const ColumnPicker: React.FC<ColumnPickerProps> = ({ columns, visible, onToggle }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const shown = columns.filter((column) => visible(column.id)).length;

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-30 hidden md:block">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#d5dee7] bg-white px-3 text-sm font-medium text-[#294055] shadow-sm hover:bg-[#f7fbfd]"
      >
        <Columns3 size={15} />
        Columns
        <ChevronDown size={14} className={`text-[#7b8b9c] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-[#e6eef3] bg-white py-1 shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
        >
          <p className="px-3 py-2 text-xs text-[#7b8b9c]">
            {shown} of {columns.length} shown
          </p>
          {columns.map((column) => {
            const isOn = visible(column.id);
            return (
              <button
                key={column.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={isOn}
                onClick={() => onToggle(column.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#1f2937] hover:bg-[#f4f9fc]"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {isOn && <Check size={14} strokeWidth={2.6} />}
                </span>
                <span>{column.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ColumnPicker;
