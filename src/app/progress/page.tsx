"use client";
import Link from 'next/link';
import React from 'react';
import { useJournal } from '@/hooks/useJournal';
import { Card } from '@/components/Card';
import { Calendar } from '@/components/Calendar';

export default function ProgressPage() {
    const { entries, loading, deleteEntry } = useJournal();

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading journal...</div>;

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "growth-book-journal.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div style={{ padding: '2rem 1.5rem', paddingBottom: '100px' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Your Journey</h1>
                <button
                    onClick={handleExport}
                    style={{
                        background: 'none',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Export
                </button>
            </div>

            <Calendar datesWithEntries={entries.map(e => e.date)} />

            {entries.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍃</div>
                    <p>No entries yet.</p>
                    <p>Start your growth journey today!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {entries.sort((a, b) => b.timestamp - a.timestamp).map((entry) => (
                        <Card
                            key={entry.id}
                            actions={
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link href={`/write?id=${entry.id}`} style={{ fontSize: '1.2rem', padding: '4px' }}>
                                        ✏️
                                    </Link>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this entry?')) {
                                                deleteEntry(entry.id);
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            }
                        >
                            <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>
                                {entry.date}
                            </div>
                            <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                {entry.prompt}
                            </div>
                            <p style={{ fontSize: '1rem', lineHeight: '1.5', color: '#444', whiteSpace: 'pre-wrap' }}>
                                {entry.content}
                            </p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
