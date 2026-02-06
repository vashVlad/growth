"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { AboutSection } from '@/components/AboutSection';
import { ContextualHelp } from '@/components/ContextualHelp';
import { useJournal } from '@/hooks/useJournal';
import { useTheme } from '@/hooks/useTheme';
import { getLocalDateISOString, formatDateForDisplay } from '@/utils/date';

export default function TodayPage() {
    const { getEntryByDate } = useJournal();
    const [date, setDate] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    const { toggleTheme } = useTheme();

    // Date Logic
    useEffect(() => {
        const todayISO = getLocalDateISOString();
        setDate(formatDateForDisplay(todayISO));

        // Check for existing entry
        const existing = getEntryByDate(todayISO);
        if (existing) {
            setIsComplete(true);
        }
    }, [getEntryByDate]);

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
        <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', paddingBottom: '100px' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--foreground-muted)' }}>
                        {date}
                    </h2>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                        {isComplete ? "You're all set" : "Today's Prompt"}
                    </h1>
                </div>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        color: 'var(--foreground)'
                    }}
                    aria-label="Toggle Dark Mode"
                >
                    🌗
                </button>
            </header>

            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: isComplete ? 'var(--primary)' : 'var(--border)' }}>
                {isComplete ? (
                    <div className="animate-fade-in">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--primary)' }}>
                            Reflection Complete
                        </h3>
                        <p style={{ fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--foreground)' }}>
                            Great job showing up for yourself today.
                        </p>
                        <Link
                            href="/progress"
                            className="btn-primary"
                            style={{
                                display: 'inline-block',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                backgroundColor: 'var(--surface)',
                                color: 'var(--primary)',
                                border: '1px solid var(--primary)'
                            }}
                        >
                            Review Today's Entry
                        </Link>
                    </div>
                ) : (
                    <>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--primary)' }}>
                            {todayPrompt}
                        </h3>
                        <p style={{ fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--foreground)' }}>
                            Take a moment to reflect on this. There's no right or wrong answer.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Link
                                    href={`/write?prompt=${encodeURIComponent(todayPrompt)}&mode=free`}
                                    className="btn-secondary"
                                    style={{
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        padding: '1rem 0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--primary)',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        width: '100%',
                                        height: '100%'
                                    }}
                                >
                                    <span style={{ fontWeight: '600', marginBottom: '4px' }}>Purpose Reflection</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 'normal' }}>Explore meaning</span>
                                </Link>
                                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                                    <ContextualHelp
                                        title="Purpose Reflection"
                                        color="var(--primary)"
                                        content="Use this space to explore what matters to you, in your own words. Focus on meaning, direction, and understanding yourself. There are no right or wrong answers."
                                    />
                                </div>
                            </div>

                            <div style={{ flex: 1, position: 'relative' }}>
                                <Link
                                    href={`/write?prompt=${encodeURIComponent(todayPrompt)}&mode=growth`}
                                    className="btn-secondary"
                                    style={{
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        padding: '1rem 0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--primary)',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        width: '100%',
                                        height: '100%'
                                    }}
                                >
                                    <span style={{ fontWeight: '600', marginBottom: '4px' }}>Growth Reflection</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 'normal' }}>Align & Improve</span>
                                </Link>
                                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                                    <ContextualHelp
                                        title="Growth Reflection"
                                        color="var(--primary)"
                                        content="This reflection helps you notice what you're learning and how you're growing. It uses structured questions to focus on alignment, actionable improvements, and self-correction."
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--foreground)' }}>Quote of the Day</h3>
                <div style={{ fontStyle: 'italic', color: 'var(--foreground-muted)', borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
                    "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong."
                </div>
            </div>

            <AboutSection />
        </div>
    );
}
