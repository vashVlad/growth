"use client";
import React, { useState } from 'react';

interface CalendarProps {
    datesWithEntries: string[]; // ['2023-10-27', '2023-10-28']
    selectedDate?: string | null;
    onDateSelect?: (date: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ datesWithEntries, selectedDate, onDateSelect }) => {
    const [currentDate] = useState(new Date());

    // Get days in current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const days = [];
    // Fill empty slots for previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    // Fill actual days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const isEntryDate = (date: Date) => {
        // Use local YYYY-MM-DD for consistency with entries
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return datesWithEntries.includes(dateStr);
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="card mb-6"
            style={{ marginBottom: '1.5rem' }}
        >
            <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>
                {monthName} {year}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', paddingBottom: '0.5rem' }}>{d}</div>
                ))}

                {days.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} />;

                    const hasEntry = isEntryDate(date);
                    const dateStr = formatDate(date);
                    const isSelected = selectedDate === dateStr;
                    const isToday = date.toDateString() === new Date().toDateString();

                    // Determine background color priority: Selected > Entry > Today > Default
                    let bg = 'transparent';
                    let color = 'inherit';
                    let fontWeight = 'normal';

                    if (isSelected) {
                        bg = 'var(--accent)';
                        color = 'var(--accent-foreground)';
                        fontWeight = 'bold';
                    } else if (hasEntry) {
                        bg = 'var(--primary)';
                        color = 'var(--primary-foreground)';
                        fontWeight = 'bold';
                    } else if (isToday) {
                        bg = 'var(--secondary)';
                        fontWeight = 'bold';
                    }

                    return (
                        <div key={idx}
                            onClick={() => onDateSelect && onDateSelect(dateStr)}
                            style={{
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                borderRadius: '50%',
                                backgroundColor: bg,
                                color: color,
                                fontWeight: fontWeight,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}>
                            {date.getDate()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
