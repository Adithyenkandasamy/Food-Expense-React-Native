/**
 * MessMate - Utility Helpers
 */

/**
 * Format a number as Indian Rupees.
 */
export function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format date as relative time (today, yesterday, etc.)
 */
export function formatRelativeDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateStr);
}

/**
 * Get initials from a name.
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Get today's date as YYYY-MM-DD.
 */
export function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get color for balance (green = receives, red = pays).
 */
export function getBalanceColor(balance: number): string {
    if (balance > 0) return '#10B981';
    if (balance < 0) return '#EF4444';
    return '#6B7280';
}
