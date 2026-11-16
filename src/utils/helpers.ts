// Currency formatting in INR
export const formatINR = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date string
export const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format datetime string
export const formatDateTime = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get date range presets
export const getDateRange = (preset: string): { from: string; to: string } => {
  const today = new Date();
  const toDate = (d: Date) => d.toISOString().split('T')[0];
  
  switch (preset) {
    case 'today':
      return { from: toDate(today), to: toDate(today) };
    case 'yesterday': {
      const yd = new Date(today);
      yd.setDate(yd.getDate() - 1);
      return { from: toDate(yd), to: toDate(yd) };
    }
    case 'last7days': {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { from: toDate(d), to: toDate(today) };
    }
    case 'thisMonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toDate(start), to: toDate(today) };
    }
    case 'lastMonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: toDate(start), to: toDate(end) };
    }
    case 'thisYear': {
      const start = new Date(today.getFullYear(), 0, 1);
      return { from: toDate(start), to: toDate(today) };
    }
    default:
      return { from: '', to: '' };
  }
};

// Class name helper
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Check if delivery is overdue
export const isOverdue = (expectedDate: string, status: string): boolean => {
  if (status === 'DELIVERED') return false;
  return new Date(expectedDate) < new Date();
};

