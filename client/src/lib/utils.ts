// Format paise to INR string
export function formatINR(paise: number, symbol = '₹'): string {
  const inr = paise / 100;
  return `${symbol}${inr.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// Format date
export function formatDate(date: string | Date, fmt = 'short'): string {
  const d = new Date(date);
  if (fmt === 'short') return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  if (fmt === 'long') return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  if (fmt === 'month-year') return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  return d.toLocaleDateString('en-IN');
}

// Get membership status badge class
export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    active: 'badge-active',
    expiring_soon: 'badge-expiring',
    expired: 'badge-expired',
    suspended: 'badge-suspended',
    inactive: 'badge-inactive',
    pending: 'badge-pending',
    approved: 'badge-active',
    rejected: 'badge-expired',
    archived: 'badge-inactive',
  };
  return map[status] || 'badge-inactive';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    expiring_soon: 'Expiring Soon',
    expired: 'Expired',
    suspended: 'Suspended',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    archived: 'Archived',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return map[status] || status;
}

export function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    card: 'Card',
    other: 'Other',
  };
  return map[method] || method;
}

export function truncate(str: string, len = 40): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// Download a blob as file
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
