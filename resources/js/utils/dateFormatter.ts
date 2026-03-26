/**
 * Date Formatter Utility
 *
 * Centralized date formatting functions for consistent date display across the application.
 * All functions use Indonesian locale ('id-ID') by default.
 */

type DateInput = string | Date | null | undefined;

/**
 * Format date to long format: "1 Januari 2024"
 */
export const formatDate = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};

/**
 * Format date to Indonesian format with day name: "Kamis, 26 Maret 2026"
 */
export const formatDateShort = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};

/**
 * Format date to numeric format: "01 Jan 2024"
 */
export const formatDateNumeric = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};

/**
 * Format datetime: "1 Januari 2024, 14:30"
 */
export const formatDateTime = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '-';
    }
};

/**
 * Format datetime short: "01/01/2024 14:30"
 */
export const formatDateTimeShort = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '-';
    }
};

/**
 * Format time only: "14:30"
 */
export const formatTime = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '-';
    }
};

/**
 * Format time with seconds: "14:30:45"
 */
export const formatTimeWithSeconds = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch {
        return '-';
    }
};

/**
 * Get day name: "Senin"
 */
export const getDayName = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
        });
    } catch {
        return '-';
    }
};

/**
 * Get month name: "Januari"
 */
export const getMonthName = (date: DateInput): string => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            month: 'long',
        });
    } catch {
        return '-';
    }
};

/**
 * Format relative time: "2 hari yang lalu", "baru saja", etc.
 */
export const formatRelative = (date: DateInput): string => {
    if (!date) return '-';
    try {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Baru saja';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} menit yang lalu`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} jam yang lalu`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} hari yang lalu`;
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `${diffInWeeks} minggu yang lalu`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} bulan yang lalu`;
        }

        const diffInYears = Math.floor(diffInDays / 365);
        return `${diffInYears} tahun yang lalu`;
    } catch {
        return '-';
    }
};

/**
 * Check if date is today
 */
export const isToday = (date: DateInput): boolean => {
    if (!date) return false;
    try {
        const today = new Date();
        const checkDate = new Date(date);
        return (
            today.getDate() === checkDate.getDate() &&
            today.getMonth() === checkDate.getMonth() &&
            today.getFullYear() === checkDate.getFullYear()
        );
    } catch {
        return false;
    }
};

/**
 * Check if date is in the past
 */
export const isPast = (date: DateInput): boolean => {
    if (!date) return false;
    try {
        return new Date(date) < new Date();
    } catch {
        return false;
    }
};

/**
 * Check if date is in the future
 */
export const isFuture = (date: DateInput): boolean => {
    if (!date) return false;
    try {
        return new Date(date) > new Date();
    } catch {
        return false;
    }
};

/**
 * Format date for input[type="date"]: "2024-01-01"
 */
export const formatForInput = (date: DateInput): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
};

/**
 * Get date range (YYYY-MM-DD strings) for a named period filter.
 * Returns { start: '', end: '' } when period is empty or unrecognized.
 */
export const getDateRangeForPeriod = (period: string): { start: string; end: string } => {
    const now = new Date();
    if (period === 'hari_ini') {
        const d = now.toISOString().split('T')[0];
        return { start: d, end: d };
    }
    if (period === 'minggu_ini') {
        const day = now.getDay();
        const first = now.getDate() - day;
        return {
            start: new Date(now.getFullYear(), now.getMonth(), first).toISOString().split('T')[0],
            end: new Date(now.getFullYear(), now.getMonth(), first + 6).toISOString().split('T')[0],
        };
    }
    if (period === 'bulan_ini') {
        return {
            start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
        };
    }
    if (period === 'tahun_ini') {
        return {
            start: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
            end: new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0],
        };
    }
    return { start: '', end: '' };
};

/**
 * Format date for input[type="datetime-local"]: "2024-01-01T14:30"
 */
export const formatForDateTimeInput = (date: DateInput): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
        return '';
    }
};
