"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { AboutSection } from '@/components/AboutSection';
import { ContextualHelp } from '@/components/ContextualHelp';
import { useJournal } from '@/hooks/useJournal';
import { useTheme } from '@/hooks/useTheme';
import { getLocalDateISOString, formatDateForDisplay } from '@/utils/date';

import { DAILY_PROMPTS, DAILY_QUOTES } from '@/data/dailyContent';
import { FeedbackCard } from '@/components/FeedbackCard';

export default function TodayPage() {
    const { getEntryByDate } = useJournal();
    const [date, setDate] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [prompt, setPrompt] = useState(DAILY_PROMPTS[0]);
    const [quote, setQuote] = useState(DAILY_QUOTES[0]);
    const [showInstallHelp, setShowInstallHelp] = useState(true);

    const { toggleTheme } = useTheme();

    // Date Logic
    useEffect(() => {
        const todayISO = getLocalDateISOString();
        setDate(formatDateForDisplay(todayISO));

        // Calculate stable day index based on local calendar date (not just 24h chunks)
        const todayDate = new Date();
        const startOfEpoch = new Date(2025, 0, 1); // Fixed epoch
        const dayIndex = Math.floor((todayDate.getTime() - startOfEpoch.getTime()) / (1000 * 60 * 60 * 24));

        // Rotate Content
        setPrompt(DAILY_PROMPTS[Math.abs(dayIndex) % DAILY_PROMPTS.length]);
        setQuote(DAILY_QUOTES[Math.abs(dayIndex) % DAILY_QUOTES.length]);

        // Check for existing entry
        const existing = getEntryByDate(todayISO);
        if (existing) {
            setIsComplete(true);
        }
    }, [getEntryByDate]);

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    <ContextualHelp
                        title="About Growth Book"
                        color="var(--foreground)"
                        content={<AboutSection />}
                    />
                </div>
            </header>

            <div className="animate-fade-in" style={{ marginBottom: '2.5rem', marginTop: '-1rem' }}>
                <div style={{ fontStyle: 'italic', color: 'var(--foreground-muted)', borderLeft: '3px solid var(--accent)', paddingLeft: '1rem', fontSize: '1rem' }}>
                    "{quote}"
                </div>
            </div>

            <div className="card" style={{ padding: '20px 10px', textAlign: 'center', borderColor: isComplete ? 'var(--primary)' : 'var(--border)' }}>
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
                            {prompt}
                        </h3>
                        <p style={{ fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--foreground)' }}>
                            Take a moment to reflect on this. There's no right or wrong answer.
                        </p>
                        <div className="reflection-buttons-container">
                            <div className="reflection-button-wrapper">
                                <Link
                                    href={`/write?prompt=${encodeURIComponent(prompt)}&mode=free`}
                                    className="btn-secondary"
                                    style={{
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        padding: '1rem 2.5rem', // Symmetric padding to keep text centered & avoid icon
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

                            <div className="reflection-button-wrapper">
                                <Link
                                    href={`/write?prompt=${encodeURIComponent(prompt)}&mode=growth`}
                                    className="btn-secondary"
                                    style={{
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        padding: '1rem 2.5rem', // Symmetric padding to keep text centered & avoid icon
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

            {showInstallHelp && (
                <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '1rem', background: 'var(--surface-highlight)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                    <button
                        onClick={() => setShowInstallHelp(false)}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--foreground-muted)',
                            fontSize: '1.25rem',
                            lineHeight: 1,
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7
                        }}
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.25rem', paddingRight: '1.5rem' }}>Add to Home Screen</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--foreground)', margin: 0 }}>
                        On iPhone: Tap the Share icon in Safari, then select “Add to Home Screen”.
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', margin: 0 }}>
                        This lets you use the app like a native app.
                    </p>
                </div>
            )}

            <FeedbackCard />

            <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--foreground-muted)', opacity: 0.7 }}>
                Created by Vladyslav Vashchuk
            </div>
        </div>
    );
}
