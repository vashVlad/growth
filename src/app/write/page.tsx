"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJournal } from '@/hooks/useJournal';
import { useAutoResizeTextArea } from '@/hooks/useAutoResizeTextArea';
import { getLocalDateISOString } from '@/utils/date';

function WriteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { saveEntry, updateEntry, entries } = useJournal();

    const [content, setContent] = useState('');
    const [prompt, setPrompt] = useState('Free Write');
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Milestone 10: Dual Writing Modes
    const [reflectionMode, setReflectionMode] = useState<'free' | 'growth'>('free'); // Default to Free Write
    const [growthFields, setGrowthFields] = useState<{
        learnedText?: string;
        alignmentText?: string;
        improveTomorrowText?: string;
    }>({ learnedText: '', alignmentText: '', improveTomorrowText: '' });

    // Milestone 7: Core Reflection Questions (For Free Write)
    const [reflectionAnchors, setReflectionAnchors] = useState<{
        whatStayed?: string;
        perspectiveChange?: string;
        excitedText?: string;
        drainedText?: string;
        gratefulText?: string;
    }>({ whatStayed: '', perspectiveChange: '', excitedText: '', drainedText: '', gratefulText: '' });
    const [highlight, setHighlight] = useState<{ type: 'breakthrough' | 'win' | 'loss'; note?: string } | undefined>(undefined);
    const [showReflection, setShowReflection] = useState(false);

    const targetId = searchParams.get('id');
    const targetPrompt = searchParams.get('prompt');
    const targetDate = searchParams.get('date');
    const targetMode = searchParams.get('mode');
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

            // Load Mode & Fields
            if (targetEntry.reflectionMode) {
                setReflectionMode(targetEntry.reflectionMode);
            }
            if (targetEntry.learnedText || targetEntry.alignmentText || targetEntry.improveTomorrowText) {
                setGrowthFields({
                    learnedText: targetEntry.learnedText || '',
                    alignmentText: targetEntry.alignmentText || '',
                    improveTomorrowText: targetEntry.improveTomorrowText || ''
                });
                setShowReflection(true);
            }

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
                // If we just switched from Edit -> New, reset state but check params
                setEditId(null);
                setContent('');
                setReflectionAnchors({ whatStayed: '', perspectiveChange: '', excitedText: '', drainedText: '', gratefulText: '' });
                setGrowthFields({ learnedText: '', alignmentText: '', improveTomorrowText: '' });
                setHighlight(undefined);
                setShowReflection(false);
            }

            // Set prompt if provided
            if (targetPrompt && prompt !== targetPrompt) {
                setPrompt(targetPrompt);
            }

            // Set reflection mode if provided in URL (and we are not editing)
            // We prioritize the URL param for new entries
            if (targetMode === 'growth' || targetMode === 'free') {
                if (reflectionMode !== targetMode) {
                    setReflectionMode(targetMode);
                }
            } else if (editId !== null) {
                // Reset to free if we just cleared edit and no mode param
                setReflectionMode('free');
            }
        }
    }, [targetId, targetPrompt, targetDate, targetMode, targetEntry, editId]);

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
                        reflectionMode: reflectionMode,
                        reflectionAnchors: reflectionAnchors,
                        learnedText: growthFields.learnedText,
                        alignmentText: growthFields.alignmentText,
                        improveTomorrowText: growthFields.improveTomorrowText,
                        highlight: highlight
                    });
                }
            } else {
                saveEntry({
                    date: targetDate || getLocalDateISOString(),
                    prompt: prompt,
                    content: content,
                    reflectionMode: reflectionMode,
                    reflectionAnchors: reflectionAnchors,
                    learnedText: growthFields.learnedText,
                    alignmentText: growthFields.alignmentText,
                    improveTomorrowText: growthFields.improveTomorrowText,
                    highlight: highlight
                });
            }
            setLoading(false);
            router.push('/progress');
        }, 500);
    };

    const textareaRef = useAutoResizeTextArea(content);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    // Check if editing a past entry or writing a backdated one
    const isPastEntry = React.useMemo(() => {
        const today = getLocalDateISOString();

        // Case 1: Editing existing entry
        if (editId) {
            const entry = entries.find(e => e.id === editId);
            return entry ? entry.date !== today : false;
        }

        // Case 2: Writing new backdated entry
        if (targetDate) {
            return targetDate !== today;
        }

        return false;
    }, [editId, entries, targetDate]);

    // Derived display date
    const displayDate = React.useMemo(() => {
        if (targetDate) return targetDate;
        if (editId) {
            const entry = entries.find(e => e.id === editId);
            if (entry) return entry.date;
        }
        return null;
    }, [targetDate, editId, entries]);

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Mode Selector (Milestone 10) */}
            <div style={{ display: 'flex', marginBottom: '1.5rem', background: 'var(--surface-highlight)', borderRadius: '8px', padding: '4px' }}>
                <button
                    onClick={() => setReflectionMode('free')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: reflectionMode === 'free' ? 'var(--surface)' : 'transparent',
                        color: reflectionMode === 'free' ? 'var(--primary)' : 'var(--foreground-muted)',
                        boxShadow: reflectionMode === 'free' ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Purpose
                </button>
                <button
                    onClick={() => setReflectionMode('growth')}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: reflectionMode === 'growth' ? 'var(--surface)' : 'transparent',
                        color: reflectionMode === 'growth' ? 'var(--primary)' : 'var(--foreground-muted)',
                        boxShadow: reflectionMode === 'growth' ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Growth
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                        {displayDate ? `Entry for ${displayDate}` : 'Writing about:'}
                    </div>
                    {isPastEntry && (
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: 'var(--foreground-muted)',
                            background: 'var(--surface-highlight)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border)'
                        }}>
                            {editId ? 'Editing Past' : 'Backdating'}
                        </div>
                    )}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary)', lineHeight: '1.4' }}>
                    {prompt}
                </h2>
            </div>

            <textarea
                ref={textareaRef}
                value={content}
                onChange={handleInput}
                placeholder={prompt === 'Free Write'
                    ? "Write whatever comes up for you..."
                    : "Write a few thoughts in response to this prompt..."}
                style={{
                    width: '100%',
                    minHeight: '10vh',
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

            {/* Reflection Questions - Conditional Rendering */}
            {reflectionMode === 'growth' ? (
                // GROWTH REFLECTION MODE
                <div className="animate-fade-in" style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', opacity: 0.7, marginBottom: '0.5rem' }}>
                        Growth Reflection
                    </div>

                    {/* 1. Learned */}
                    <div>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                            What did I learn or improve upon today?
                        </label>
                        <textarea
                            value={growthFields.learnedText || ''}
                            onChange={(e) => setGrowthFields({ ...growthFields, learnedText: e.target.value })}
                            placeholder="Insights, skills, or small wins..."
                            style={{ width: '100%', minHeight: '80px', border: 'none', background: 'transparent', borderRadius: '8px', padding: '1rem', resize: 'none', fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)', fontFamily: 'inherit', outline: 'none' }}
                        />
                    </div>

                    {/* 2. Alignment */}
                    <div>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                            Did my actions align with my values and goals?
                        </label>
                        <textarea
                            value={growthFields.alignmentText || ''}
                            onChange={(e) => setGrowthFields({ ...growthFields, alignmentText: e.target.value })}
                            placeholder="Reflect on your choices..."
                            style={{ width: '100%', minHeight: '80px', border: 'none', background: 'transparent', borderRadius: '8px', padding: '1rem', resize: 'none', fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)', fontFamily: 'inherit', outline: 'none' }}
                        />
                    </div>

                    {/* 3. Improve */}
                    <div>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                            What can I do differently tomorrow to improve?
                        </label>
                        <textarea
                            value={growthFields.improveTomorrowText || ''}
                            onChange={(e) => setGrowthFields({ ...growthFields, improveTomorrowText: e.target.value })}
                            placeholder="Actionable steps..."
                            style={{ width: '100%', minHeight: '80px', border: 'none', background: 'transparent', borderRadius: '8px', padding: '1rem', resize: 'none', fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)', fontFamily: 'inherit', outline: 'none' }}
                        />
                    </div>
                </div>
            ) : (
                // FREE WRITE MODE (Default)
                <div className="animate-fade-in" style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', opacity: 0.7, marginBottom: '0.5rem' }}>
                        Purpose Reflection
                    </div>

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
                            style={{ width: '100%', minHeight: '80px', border: 'none', background: 'transparent', borderRadius: '8px', padding: '1rem', resize: 'none', fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)', fontFamily: 'inherit', outline: 'none' }}
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
                            style={{ width: '100%', minHeight: '80px', border: 'none', background: 'transparent', borderRadius: '8px', padding: '1rem', resize: 'none', fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)', fontFamily: 'inherit', outline: 'none' }}
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
                            style={{ width: '100%', minHeight: '80px', border: 'none', background: 'transparent', borderRadius: '8px', padding: '1rem', resize: 'none', fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)', fontFamily: 'inherit', outline: 'none' }}
                        />
                    </div>
                </div>
            )}

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
