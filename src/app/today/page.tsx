"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { useJournal } from '@/hooks/useJournal';

export default function TodayPage() {
    const { getEntryByDate } = useJournal();
    const [date, setDate] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    // Theme Management
    useEffect(() => {
        // Initialize theme from local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    useEffect(() => {
        const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        setDate(todayStr);

        // Check for existing entry
        const isoDate = new Date().toISOString().split('T')[0];
        const existing = getEntryByDate(isoDate);
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
                        <Link
                            href={`/write?prompt=${encodeURIComponent(todayPrompt)}`}
                            className="btn-primary"
                            style={{
                                display: 'inline-block',
                                textDecoration: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            Start Writing
                        </Link>
                    </>
                )}
            </div>

            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--foreground)' }}>Quote of the Day</h3>
                <div style={{ fontStyle: 'italic', color: 'var(--foreground-muted)', borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
                    "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong."
                </div>
            </div>
        </div>
    );
}
