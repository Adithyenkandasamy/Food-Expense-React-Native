import dayjs from 'dayjs';

export const formatCurrency = (value: number, currency = 'INR'): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
};

export const formatDate = (value?: string, format = 'DD MMM YYYY'): string => {
  if (!value) return 'N/A';
  const d = dayjs(value);
  return d.isValid() ? d.format(format) : 'N/A';
};

export const formatShortDate = (value?: string): string => {
  return formatDate(value, 'DD MMM');
};

export const formatRelativeDate = (value?: string): string => {
  if (!value) return '';
  const d = dayjs(value);
  if (!d.isValid()) return '';
  const today = dayjs();
  if (d.isSame(today, 'day')) return 'Today';
  if (d.isSame(today.subtract(1, 'day'), 'day')) return 'Yesterday';
  return d.format('DD MMM');
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
};

export const capitalize = (value: string): string => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] ?? '';
};

export const getCategoryIcon = (category: string): string => {
  const map: Record<string, string> = {
    Food: 'UtensilsCrossed',
    Groceries: 'ShoppingCart',
    Utilities: 'Zap',
    Transport: 'Car',
    Entertainment: 'Clapperboard',
    Other: 'Package',
  };
  return map[category] ?? 'Receipt';
};
