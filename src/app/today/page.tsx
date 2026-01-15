"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';

export default function TodayPage() {
    const [date, setDate] = useState('');

    useEffect(() => {
        setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    }, []);

    const prompts = [
        "What is one small win you had today?",
        "What are you grateful for right now?",
        "What is challenging you today, and how are you handling it?",
        "How did you help someone today?",
        "What is one thing you learned today?"
    ];

    // Simple daily rotation based on day of month
    const todayPrompt = prompts[new Date().getDate() % prompts.length];

    return (
        <div style={{ padding: '2rem 1.5rem', paddingBottom: '100px' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>
                    Today's Focus
                </h2>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                    {date}
                </h1>
            </header>

            <Card className="mb-6">
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--primary)' }}>
                    Daily Prompt
                </h3>
                <p style={{ fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {todayPrompt}
                </p>
                <Link
                    href={`/write?prompt=${encodeURIComponent(todayPrompt)}`}
                    style={{
                        display: 'inline-block',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    Answer Prompt
                </Link>
            </Card>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Quote of the Day</h3>
                <div style={{ fontStyle: 'italic', color: '#555', borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
                    "The only way to do great work is to love what you do."
                </div>
            </div>
        </div>
    );
}
