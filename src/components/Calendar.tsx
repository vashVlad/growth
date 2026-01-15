"use client";
import React, { useState } from 'react';

interface CalendarProps {
    datesWithEntries: string[]; // ['2023-10-27', '2023-10-28']
}

export const Calendar: React.FC<CalendarProps> = ({ datesWithEntries }) => {
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
        const iso = date.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time usually, but safest to construct manually if timezone issues arise. 
        // Actually, let's just stick to straight YYYY-MM-DD from the input strings.
        // To match locally created "YYYY-MM-DD" from new Date().toISOString().split('T')[0] which is UTC... 
        // Ah, wait. new Date().toISOString() gives UTC. 
        // In Write page I used: new Date().toISOString().split('T')[0] which captures UTC date.
        // So here I should check matching ISO strings.
        const dateStr = date.toISOString().split('T')[0];
        return datesWithEntries.includes(dateStr);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-secondary p-4 mb-6"
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid var(--secondary)',
                padding: '1.5rem',
                marginBottom: '1.5rem'
            }}
        >
            <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>
                {monthName} {year}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} style={{ fontSize: '0.75rem', color: '#888', paddingBottom: '0.5rem' }}>{d}</div>
                ))}

                {days.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} />;

                    const hasEntry = isEntryDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <div key={idx} style={{
                            aspectRatio: '1/1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            borderRadius: '50%',
                            backgroundColor: hasEntry ? 'var(--primary)' : (isToday ? '#E8E8E3' : 'transparent'),
                            color: hasEntry ? 'white' : 'inherit',
                            fontWeight: (hasEntry || isToday) ? 'bold' : 'normal'
                        }}>
                            {date.getDate()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
