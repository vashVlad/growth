export const getLocalDateISOString = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Safe date parsing that avoids timezone issues by simple string manipulation
// Assumes input is "YYYY-MM-DD" or similar ISO-like date string
export const getSafeDateParts = (dateStr: string) => {
    if (!dateStr) return { year: 0, month: 0, day: 0 };
    // Handle both YYYY-MM-DD and full ISO strings
    const isoDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [y, m, d] = isoDate.split('-').map(Number);
    return { year: y, month: m, day: d };
};

// Returns a Date object set to noon local time to avoid timezone offset issues
export const getSafeDate = (dateStr: string): Date => {
    const { year, month, day } = getSafeDateParts(dateStr);
    return new Date(year, month - 1, day, 12, 0, 0);
};

export const formatDateForDisplay = (dateStr: string): string => {
    // "2023-01-20" -> "Friday, January 20"
    const date = getSafeDate(dateStr);

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
};

export const formatDateForPdf = (dateStr: string): string => {
    // Shorter format for PDF headers or specific needs if different from display
    return formatDateForDisplay(dateStr);
};
