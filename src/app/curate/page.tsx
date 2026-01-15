"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJournal, Entry, JournalDraft } from '@/hooks/useJournal';

export default function CurateJournalPage() {
    const router = useRouter();
    const { entries, saveDraft } = useJournal();
    const [step, setStep] = useState(1);

    // Step 1: Selection State
    const [dateRange, setDateRange] = useState<'30' | '90' | 'all'>('30');
    const [includeHighlights, setIncludeHighlights] = useState(true);
    const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());

    // Step 2: Structure State
    const [sections, setSections] = useState([
        { id: 'opening', title: 'Start', order: 0 },
        { id: 'breakthroughs', title: 'Breakthroughs', order: 1 },
        { id: 'wins', title: 'Wins', order: 2 },
        { id: 'losses', title: 'Lessons Learned', order: 3 },
        { id: 'chronological', title: 'Daily Reflections', order: 4 },
    ]);

    // Step 3: Intent State
    const [intent, setIntent] = useState('');
    const [draftTitle, setDraftTitle] = useState('My Journal');

    // Init Selection logic
    useEffect(() => {
        if (entries.length > 0) {
            filterEntries();
        }
    }, [entries, dateRange, includeHighlights]);

    const filterEntries = () => {
        const now = new Date();
        const cutoff = new Date();
        if (dateRange === '30') cutoff.setDate(now.getDate() - 30);
        if (dateRange === '90') cutoff.setDate(now.getDate() - 90);
        if (dateRange === 'all') cutoff.setFullYear(2000); // Way back

        const filtered = entries.filter(e => {
            const d = new Date(e.date);
            return d >= cutoff;
        });

        // Default all to selected initially
        setSelectedEntryIds(new Set(filtered.map(e => e.id)));
    };

    const handleSave = () => {
        const newDraft: JournalDraft = {
            id: crypto.randomUUID(),
            title: draftTitle,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            intent,
            criteria: {
                startDate: dateRange !== 'all' ? new Date(Date.now() - (parseInt(dateRange) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : undefined,
                includeHighlights
            },
            includedEntryIds: Array.from(selectedEntryIds),
            sections
        };
        saveDraft(newDraft);
        router.push('/progress');
    };

    // Render Steps
    // ... Implementation of UI ...
    // Simplified for tool size limits, will expand in next step
    return (
        <div style={{ padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '100px' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', marginRight: '1rem', cursor: 'pointer', color: 'var(--foreground-muted)' }}>←</button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {step === 1 && "Curate Your Journal"}
                    {step === 2 && "Structure & Flow"}
                    {step === 3 && "Set Your Intent"}
                    {step === 4 && "Preview Artifact"}
                </h1>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                {[1, 2, 3, 4].map(s => (
                    <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'var(--primary)' : 'var(--border)' }} />
                ))}
            </div>

            {/* STEP 1: SELECTION */}
            {step === 1 && (
                <div className="animate-fade-in">
                    <p style={{ marginBottom: '1.5rem', color: 'var(--foreground-muted)' }}>Choose the moments you want to revisit. We’ve pre-selected entries based on your range.</p>

                    <div className="card" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Time Period</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['30', '90', 'all'].map(r => (
                                <button key={r}
                                    onClick={() => setDateRange(r as any)}
                                    style={{
                                        flex: 1, padding: '0.5rem',
                                        borderRadius: '8px',
                                        border: dateRange === r ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: dateRange === r ? 'var(--color-green-100)' : 'transparent',
                                        color: dateRange === r ? 'var(--primary)' : 'var(--foreground)'
                                    }}
                                >
                                    {r === 'all' ? 'All Time' : `Last ${r} Days`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {selectedEntryIds.size} entries selected
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {entries.filter(e => {
                            const now = new Date();
                            const cutoff = new Date();
                            if (dateRange === '30') cutoff.setDate(now.getDate() - 30);
                            if (dateRange === '90') cutoff.setDate(now.getDate() - 90);
                            if (dateRange === 'all') cutoff.setFullYear(2000);
                            return new Date(e.date) >= cutoff;
                        }).map(entry => (
                            <div key={entry.id}
                                onClick={() => {
                                    const newSet = new Set(selectedEntryIds);
                                    if (newSet.has(entry.id)) newSet.delete(entry.id);
                                    else newSet.add(entry.id);
                                    setSelectedEntryIds(newSet);
                                }}
                                className="card"
                                style={{
                                    padding: '1rem',
                                    border: selectedEntryIds.has(entry.id) ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    opacity: selectedEntryIds.has(entry.id) ? 1 : 0.6,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{entry.date}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>{(entry.prompt || entry.content).substring(0, 40)}...</div>
                                </div>
                                {selectedEntryIds.has(entry.id) && <span style={{ color: 'var(--primary)' }}>✓</span>}
                            </div>
                        ))}
                    </div>

                    <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setStep(2)}>Next: Structure</button>
                </div>
            )}

            {/* STEP 2: STRUCTURE */}
            {step === 2 && (
                <div className="animate-fade-in">
                    <p style={{ marginBottom: '1.5rem', color: 'var(--foreground-muted)' }}>This is how your journal will be organized. You can rename sections to make it yours.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {sections.sort((a, b) => a.order - b.order).map((section, idx) => (
                            <div key={section.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: 'var(--foreground-muted)', fontWeight: 'bold' }}>{idx + 1}</span>
                                <input
                                    className="input-field"
                                    value={section.title}
                                    onChange={(e) => {
                                        const newSections = sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s);
                                        setSections(newSections);
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setStep(3)}>Next: Intent</button>
                </div>
            )}

            {/* STEP 3: INTENT */}
            {step === 3 && (
                <div className="animate-fade-in">
                    <p style={{ marginBottom: '1.5rem', color: 'var(--foreground-muted)' }}>Before you finish, take a moment to reflect.</p>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name your Journal</label>
                        <input className="input-field" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
                    </div>

                    <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-highlight)' }}>
                        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>Why do you want to keep this journal?</label>
                        <textarea
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                resize: 'none',
                                background: 'transparent',
                                border: 'none',
                                padding: '0',
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                color: 'var(--foreground)',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            placeholder="I want to remember how I grew during this winter..."
                            value={intent}
                            onChange={(e) => setIntent(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setStep(4)}>Preview Artifact</button>
                </div>
            )}

            {/* STEP 4: PREVIEW */}
            {step === 4 && (
                <div className="animate-fade-in">
                    <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem', border: '2px solid var(--accent)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{draftTitle}</h2>
                        <div style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{new Date().toLocaleDateString()}</div>

                        <div style={{ textAlign: 'left', fontSize: '0.875rem', color: 'var(--foreground)', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '2rem' }}>
                            "{intent || "A collection of my thoughts and growth."}"
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)' }}>Contents</div>
                            {sections.sort((a, b) => a.order - b.order).map(s => (
                                <div key={s.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    {s.title}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', textAlign: 'center', marginBottom: '1rem' }}>
                        This draft will be saved locally.
                    </div>

                    <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>Save as Personal Artifact</button>
                </div>
            )}

        </div>
    );
}
