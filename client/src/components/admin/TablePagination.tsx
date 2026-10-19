import React from 'react';

const PAGE_SIZES = [10, 25, 50, 100];

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  shown: number;
  loading?: boolean;
  className?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  pageSize,
  total,
  shown,
  loading = false,
  className = '',
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  const sizeSelect = (
    <select
      aria-label="Rows per page"
      value={pageSize}
      disabled={loading}
      onChange={(event) => onPageSizeChange(Number(event.target.value))}
      className="h-8 rounded-md border border-[#d5dee7] bg-white px-1.5 text-xs text-[#294055] outline-none focus:border-[#c2a66e] sm:h-9 sm:px-2 sm:text-sm"
    >
      {PAGE_SIZES.map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  );

  return (
    <div className={`table-pagination border-t border-[#e6eef3] bg-white px-3 py-2 text-[#7b8b9c] sm:px-4 sm:py-3 sm:text-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <p className="shrink-0 text-xs">{shown} of {total}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 rounded-md border border-[#d5dee7] bg-white px-2 text-xs text-[#294055] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Prev
          </button>
          <span className="min-w-[2.5rem] text-center text-xs text-[#294055]">{page}/{totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="h-8 rounded-md border border-[#d5dee7] bg-white px-2 text-xs text-[#294055] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
          {sizeSelect}
        </div>
      </div>

      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <p>Showing {shown} of {total} row(s)</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span>Rows per page:</span>
            {sizeSelect}
          </label>
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="h-9 rounded-md border border-[#d5dee7] bg-white px-3 text-sm text-[#294055] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Previous
          </button>
          <span className="text-[#294055]">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="h-9 rounded-md border border-[#d5dee7] bg-white px-3 text-sm font-medium text-[#294055] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
