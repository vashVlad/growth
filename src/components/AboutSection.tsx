'use client';
import React, { useState } from 'react';

export const AboutSection: React.FC = () => {
    return (
        <div className="animate-fade-in" style={{ color: 'var(--foreground)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>Purpose</h4>
                <p style={{ color: 'var(--foreground-muted)' }}>
                    This app is a quiet space to think, reflect, and grow — one day at a time. It helps you notice patterns in your life and turn fleeting thoughts into something meaningful.
                </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>Two Ways to Reflect</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--foreground-muted)' }}>
                    <li style={{ marginBottom: '0.75rem' }}>
                        <strong>Purpose Reflection:</strong> Open-ended writing focused on meaning, direction, and self-understanding.
                    </li>
                    <li>
                        <strong>Growth Reflection:</strong> Structured questions focused on alignment, learning, and actionable improvement.
                    </li>
                </ul>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>Your Progress</h4>
                <p style={{ color: 'var(--foreground-muted)' }}>
                    Entries are stored privately on your device. The Progress view helps you look back and connect the dots over time, without the pressure of streaks or social sharing.
                </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>Your Journal as a Book</h4>
                <p style={{ color: 'var(--foreground-muted)' }}>
                    You can curate your entries and export them as a print-ready PDF. This creates a tangible personal record of your journey that you own forever.
                </p>
            </div>

            <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>Privacy</h4>
                <p style={{ color: 'var(--foreground-muted)' }}>
                    Your data stays on this device. Nothing is uploaded to a cloud server, ensuring your thoughts remain completely private.
                </p>
            </div>
        </div>
    );
};
