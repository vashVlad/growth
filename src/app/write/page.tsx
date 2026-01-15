"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJournal } from '@/hooks/useJournal';

function WriteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { saveEntry, updateEntry, entries } = useJournal();

    const [content, setContent] = useState('');
    const [prompt, setPrompt] = useState('Free Write');
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Milestone 7: Core Reflection Questions
    const [reflectionAnchors, setReflectionAnchors] = useState<{
        whatStayed?: string;
        perspectiveChange?: string;
        excitedText?: string;
        drainedText?: string;
        gratefulText?: string;
    }>({ whatStayed: '', perspectiveChange: '', excitedText: '', drainedText: '', gratefulText: '' });
    const [highlight, setHighlight] = useState<{ type: 'breakthrough' | 'win' | 'loss'; note?: string } | undefined>(undefined);
    const [showReflection, setShowReflection] = useState(false);

    // Derive target ID and Entry from props/state to ensure stability
    const targetId = searchParams.get('id');
    const targetPrompt = searchParams.get('prompt');
    const targetEntry = targetId ? entries.find(e => e.id === targetId) : null;

    useEffect(() => {
        // If we are in "Edit Mode" (targetId is present)
        if (targetId) {
            // Prevent infinite loop: Only update if we haven't initialized this ID yet
            // OR if we are waiting for the entry to load (targetEntry became available)
            if (editId === targetId && content) {
                // Already initialized and content is there. 
                // Do NOT overwrite content if user is typing (which updates state but not entry).
                // However, if we just switched IDs, editId wouldn't match targetId yet.
                return;
            }

            // If we have an ID but no entry yet (loading), wait.
            if (!targetEntry) return;

            // Initialize state from entry
            setEditId(targetId);
            setContent(targetEntry.content);
            setPrompt(targetEntry.prompt);

            // Load optional fields
            if (targetEntry.reflectionAnchors) {
                setReflectionAnchors({
                    whatStayed: targetEntry.reflectionAnchors.whatStayed || '',
                    perspectiveChange: targetEntry.reflectionAnchors.perspectiveChange || '',
                    excitedText: targetEntry.reflectionAnchors.excitedText || '',
                    drainedText: targetEntry.reflectionAnchors.drainedText || '',
                    gratefulText: targetEntry.reflectionAnchors.gratefulText || ''
                });
                if (targetEntry.reflectionAnchors.whatStayed || targetEntry.reflectionAnchors.perspectiveChange || targetEntry.reflectionAnchors.excitedText || targetEntry.reflectionAnchors.drainedText || targetEntry.reflectionAnchors.gratefulText) {
                    setShowReflection(true);
                }
            } else {
                setReflectionAnchors({ whatStayed: '', perspectiveChange: '', excitedText: '', drainedText: '', gratefulText: '' });
            }

            if (targetEntry.highlight) {
                setHighlight(targetEntry.highlight);
                setShowReflection(true);
            } else {
                setHighlight(undefined);
            }

        } else {
            // "New Entry" Mode
            if (editId !== null) {
                // If we just switched from Edit -> New, reset
                setEditId(null);
                setContent('');
                setReflectionAnchors({ whatStayed: '', perspectiveChange: '', excitedText: '', drainedText: '', gratefulText: '' });
                setHighlight(undefined);
                setShowReflection(false);
            }
            // Set prompt if provided
            if (targetPrompt && prompt !== targetPrompt) {
                setPrompt(targetPrompt);
            }
        }
    }, [targetId, targetPrompt, targetEntry, editId]);

    const handleSave = () => {
        if (!content.trim()) return;
        setLoading(true);

        // Simulate slight delay for "app feel"
        setTimeout(() => {
            if (editId) {
                // Update existing
                const existing = entries.find(e => e.id === editId);
                if (existing) {
                    updateEntry({
                        ...existing,
                        content: content,
                        reflectionAnchors: reflectionAnchors,
                        highlight: highlight
                    });
                }
            } else {
                saveEntry({
                    date: new Date().toISOString().split('T')[0],
                    prompt: prompt,
                    content: content,
                    reflectionAnchors: reflectionAnchors,
                    highlight: highlight
                });
            }
            setLoading(false);
            router.push('/progress');
        }, 500);
    };

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    // Auto-resize on initial load / content change
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>Writing about:</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary)', lineHeight: '1.4' }}>
                    {prompt}
                </h2>
            </div>

            <textarea
                ref={textareaRef}
                value={content}
                onChange={handleInput}
                placeholder="How are you feeling right now? What's on your mind?"
                style={{
                    width: '100%',
                    minHeight: '15vh',
                    border: 'none',
                    resize: 'none',
                    fontSize: '1.25rem',
                    lineHeight: '1.75',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: 'var(--foreground)',
                    paddingTop: '1rem',
                    overflow: 'hidden'
                }}
                autoFocus
            />

            {/* Core Reflection Questions */}
            <div className="animate-fade-in" style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* 1. Excited */}
                <div>
                    <label style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--primary)',
                        display: 'block',
                        marginBottom: '0.5rem',
                        opacity: 0.9
                    }}>
                        What excited you today?
                    </label>
                    <textarea
                        value={reflectionAnchors.excitedText || ''}
                        onChange={(e) => setReflectionAnchors({ ...reflectionAnchors, excitedText: e.target.value })}
                        placeholder="Moments of energy or joy..."
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            border: 'none',
                            background: 'transparent',
                            resize: 'none',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            color: 'var(--foreground)',
                            fontFamily: 'inherit',
                            outline: 'none',
                            padding: '0'
                        }}
                    />
                </div>

                {/* 2. Drained */}
                <div>
                    <label style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--primary)',
                        display: 'block',
                        marginBottom: '0.5rem',
                        opacity: 0.9
                    }}>
                        What drained your energy?
                    </label>
                    <textarea
                        value={reflectionAnchors.drainedText || ''}
                        onChange={(e) => setReflectionAnchors({ ...reflectionAnchors, drainedText: e.target.value })}
                        placeholder="Friction, fatigue, or stress..."
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            border: 'none',
                            background: 'transparent',
                            resize: 'none',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            color: 'var(--foreground)',
                            fontFamily: 'inherit',
                            outline: 'none',
                            padding: '0'
                        }}
                    />
                </div>

                {/* 3. Grateful */}
                <div>
                    <label style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--primary)',
                        display: 'block',
                        marginBottom: '0.5rem',
                        opacity: 0.9
                    }}>
                        What are you grateful for?
                    </label>
                    <textarea
                        value={reflectionAnchors.gratefulText || ''}
                        onChange={(e) => setReflectionAnchors({ ...reflectionAnchors, gratefulText: e.target.value })}
                        placeholder="Small mercies or big wins..."
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            border: 'none',
                            background: 'transparent',
                            resize: 'none',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            color: 'var(--foreground)',
                            fontFamily: 'inherit',
                            outline: 'none',
                            padding: '0'
                        }}
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={!content.trim() || loading}
                className="btn-primary"
                style={{
                    marginTop: '2rem',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: (!content.trim() || loading) ? 0.5 : 1,
                    cursor: (!content.trim() || loading) ? 'default' : 'pointer',
                    fontSize: '1.125rem',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-md)'
                }}
            >
                {loading ? 'Saving...' : (editId ? 'Update Entry' : 'Save Entry')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--foreground-muted)', opacity: 0.7 }}>
                🔒 Saved securely on this device
            </div>
        </div>
    );
}

export default function WritePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WriteContent />
        </Suspense>
    );
}
