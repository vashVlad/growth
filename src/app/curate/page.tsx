"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useJournal, Entry, JournalDraft } from '@/hooks/useJournal';
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton';
import { AnimatePresence, motion } from 'framer-motion';
import { PDF_THEMES, PdfThemeName } from '@/components/pdf/themes';
const PdfPreview = dynamic(() => import('@/components/pdf/PdfPreview').then(mod => mod.PdfPreview), { ssr: false });

// Helper to get sorted entries for a draft
const getDraftEntries = (draft: JournalDraft, allEntries: Entry[]) => {
    return draft.includedEntryIds
        .map(id => allEntries.find(e => e.id === id))
        .filter((e): e is Entry => !!e)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

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

    // Step 3: Design State (NEW)
    const [selectedTheme, setSelectedTheme] = useState<PdfThemeName>('minimal');

    // Step 4: Intent State
    const [intent, setIntent] = useState('');
    const [draftTitle, setDraftTitle] = useState('My Journal');

    // Step 5: Preview
    const [previewMode, setPreviewMode] = useState<'scroll' | 'book'>('book');

    // Memoize Filtered Entries (Step 1)
    const filteredEntries = React.useMemo(() => {
        const now = new Date();
        const cutoff = new Date();
        if (dateRange === '30') cutoff.setDate(now.getDate() - 30);
        if (dateRange === '90') cutoff.setDate(now.getDate() - 90);
        if (dateRange === 'all') cutoff.setFullYear(2000); // Way back

        return entries.filter(e => {
            const d = new Date(e.date);
            return d >= cutoff;
        });
    }, [entries, dateRange]);

    // Init Selection logic - only runs when filtered list identity changes
    useEffect(() => {
        if (filteredEntries.length > 0) {
            setSelectedEntryIds(new Set(filteredEntries.map(e => e.id)));
        }
    }, [filteredEntries]); // Dependency is now stable filteredEntries

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

    // Memoized Preview Draft (Step 5)
    // This ensures the object identity is stable unless inputs change
    const previewDraft = React.useMemo<JournalDraft>(() => ({
        id: 'preview',
        title: draftTitle,
        createdAt: Date.now(), // This will change on mount/unmount but inside render cycle it's fine. 
        // Ideally fixed timestamp or ignored.
        updatedAt: Date.now(),
        intent,
        criteria: {
            startDate: dateRange !== 'all' ? new Date(Date.now() - ((parseInt(dateRange) || 0) * 86400000)).toISOString().split('T')[0] : undefined,
            includeHighlights
        },
        includedEntryIds: Array.from(selectedEntryIds),
        sections
    }), [draftTitle, intent, dateRange, includeHighlights, selectedEntryIds, sections]);

    // Memoized Preview Entries
    const previewEntries = React.useMemo(() => {
        return getDraftEntries(previewDraft, entries);
    }, [previewDraft, entries]);

    const previewStartDate = React.useMemo(() =>
        previewEntries.length > 0 ? previewEntries[0].date : previewDraft.criteria.startDate,
        [previewEntries, previewDraft.criteria.startDate]);

    const previewEndDate = React.useMemo(() =>
        previewEntries.length > 0 ? previewEntries[previewEntries.length - 1].date : previewDraft.criteria.endDate,
        [previewEntries, previewDraft.criteria.endDate]);

    // Memoize Theme fonts for Web View
    const webViewStyles = React.useMemo(() => {
        const activeTheme = PDF_THEMES[selectedTheme];
        const serifFont = '"Georgia", "Times New Roman", serif';
        const sansFont = '"Helvetica", "Arial", sans-serif';
        const isSerif = (fontName: string) => fontName.includes('Crimson') || fontName.includes('Lora');

        return {
            themeFont: isSerif(activeTheme.fonts.body) ? serifFont : sansFont,
            headerFont: isSerif(activeTheme.fonts.header) ? serifFont : sansFont,
            activeTheme
        };
    }, [selectedTheme]);

    return (
        <div style={{ padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '100px' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '1.5rem', marginRight: '1rem', cursor: 'pointer', color: 'var(--foreground-muted)' }}>←</button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {step === 1 && "Curate Your Journal"}
                    {step === 2 && "Structure & Flow"}
                    {step === 3 && "Design Archetype"}
                    {step === 4 && "Set Your Intent"}
                    {step === 5 && "Preview Artifact"}
                </h1>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'var(--primary)' : 'var(--border)' }} />
                ))}
            </div>

            {/* STEP 1: SELECTION */}
            {step === 1 && (
                <div className="animate-fade-in">
                    <p style={{ marginBottom: '1.5rem', color: 'var(--foreground-muted)' }}>Choose the moments you want to revisit. We’ve pre-selected entries based on your range.</p>

                    <div className="card" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 'bold' }}>Time Period</label>
                            {/* Dev Helper: Stress Test */}
                            {process.env.NODE_ENV !== 'production' && (
                                <button
                                    onClick={async () => {
                                        const { createStressTestEntry } = await import('@/utils/stressTest');
                                        const testEntry = createStressTestEntry();
                                        alert("Stress test entry created. To see it in the preview:\n1. Open your browser console.\n2. Note that this architecture requires re-hydrating 'entries'.\n\nFor now, the PDF Layout Fix (wrap=true) is applied globally. You can verify it by finding any long entry you already have.");
                                    }}
                                    style={{ fontSize: '0.7rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    [Dev: Logic?]
                                </button>
                            )}
                        </div>
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
                        {filteredEntries.map(entry => (
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

            {/* STEP 2: STRUCTURE (Unchanged Logic, visually same) */}
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

                    <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setStep(3)}>Next: Design</button>
                </div>
            )}

            {/* STEP 3: DESIGN SELECTION */}
            {step === 3 && (
                <div className="animate-fade-in">
                    <p style={{ marginBottom: '1.5rem', color: 'var(--foreground-muted)' }}>Choose what feels right. You can change this anytime.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(Object.keys(PDF_THEMES) as PdfThemeName[]).map(themeKey => {
                            const theme = PDF_THEMES[themeKey];
                            const isSelected = selectedTheme === themeKey;
                            return (
                                <div
                                    key={themeKey}
                                    onClick={() => setSelectedTheme(themeKey)}
                                    className="card"
                                    style={{
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: isSelected ? 'var(--surface-highlight)' : 'var(--surface)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--foreground)' }}>{theme.name}</h3>
                                        {isSelected && <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Selected</div>}
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)', lineHeight: '1.5' }}>{theme.description}</p>

                                    {/* Mini visual cue */}
                                    <div style={{
                                        marginTop: '0.5rem',
                                        height: '6px',
                                        width: '40px',
                                        background: 'var(--border)',
                                        borderRadius: '3px',
                                        alignSelf: themeKey === 'minimal' || themeKey === 'nature' ? 'flex-start' : 'center'
                                    }} />
                                </div>
                            );
                        })}
                    </div>

                    <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setStep(4)}>Next: Intent</button>
                </div>
            )}

            {/* STEP 4: INTENT */}
            {step === 4 && (
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

                    <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setStep(5)}>Preview Artifact</button>
                </div>
            )}

            {/* STEP 5: PREVIEW */}
            {step === 5 && (
                <div className="animate-fade-in">
                    {/* Preview Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
                        <button
                            onClick={() => setPreviewMode('scroll')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid var(--border)',
                                background: previewMode === 'scroll' ? 'var(--primary)' : 'var(--surface)',
                                color: previewMode === 'scroll' ? 'white' : 'var(--foreground)',
                                cursor: 'pointer'
                            }}
                        >
                            Web View
                        </button>
                        <button
                            onClick={() => setPreviewMode('book')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid var(--border)',
                                background: previewMode === 'book' ? 'var(--primary)' : 'var(--surface)',
                                color: previewMode === 'book' ? 'white' : 'var(--foreground)',
                                cursor: 'pointer'
                            }}
                        >
                            Book Preview (6"x9")
                        </button>
                    </div>

                    {/* Preview Container */}
                    <div className="artifact-container" style={{
                        padding: '2rem',
                        marginBottom: '2rem',
                        background: previewMode === 'book' ? '#e0e0e0' : 'var(--surface)', // Slightly darker bg for book contrast
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflow: 'auto',
                        maxHeight: '70vh'
                    }}>
                        {previewMode === 'scroll' ? (
                            <div style={{ maxWidth: '600px', width: '100%', textAlign: 'left', fontFamily: webViewStyles.themeFont, lineHeight: webViewStyles.activeTheme.styles.lineHeight }}>
                                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary)', fontFamily: webViewStyles.headerFont, textTransform: webViewStyles.activeTheme.styles.headerTransform }}>{previewDraft.title}</h1>

                                <div style={{ color: 'var(--foreground-muted)', marginBottom: '2rem' }}>
                                    {previewStartDate ? new Date(previewStartDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : ''} —
                                    {previewEndDate ? new Date(previewEndDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                                </div>

                                {previewDraft.intent && (
                                    <div style={{ fontStyle: 'italic', marginBottom: '2rem', padding: '1rem', borderLeft: '3px solid var(--primary)', background: 'var(--surface-highlight)' }}>
                                        "{previewDraft.intent}"
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {previewEntries.map(entry => (
                                        <div key={entry.id}>
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: 'var(--foreground-muted)',
                                                marginBottom: '0.5rem',
                                                textTransform: webViewStyles.activeTheme.styles.headerTransform,
                                                fontSize: '0.85rem',
                                                fontFamily: webViewStyles.headerFont
                                            }}>
                                                {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            {entry.prompt !== 'Free Write' && (
                                                <div style={{ fontStyle: 'italic', color: 'var(--primary)', marginBottom: '0.5rem' }}>{entry.prompt}</div>
                                            )}
                                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: webViewStyles.activeTheme.styles.lineHeight }}>{entry.content}</div>

                                            {/* Structured Response - Web View */}
                                            {(entry.reflectionMode === 'growth' || entry.reflectionAnchors) && (
                                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-highlight)', borderRadius: '8px' }}>
                                                    {entry.reflectionMode === 'growth' ? (
                                                        <>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--primary)' }}>Growth Reflection</div>
                                                            {entry.learnedText && <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: '600' }}>Learned:</span> {entry.learnedText}</div>}
                                                            {entry.alignmentText && <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: '600' }}>Alignment:</span> {entry.alignmentText}</div>}
                                                            {entry.improveTomorrowText && <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: '600' }}>Improve:</span> {entry.improveTomorrowText}</div>}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--primary)' }}>Purpose Reflection</div>
                                                            {entry.reflectionAnchors?.excitedText && <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: '600' }}>Excited:</span> {entry.reflectionAnchors.excitedText}</div>}
                                                            {entry.reflectionAnchors?.drainedText && <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: '600' }}>Drained:</span> {entry.reflectionAnchors.drainedText}</div>}
                                                            {entry.reflectionAnchors?.gratefulText && <div style={{ marginBottom: '0.5rem' }}><span style={{ fontWeight: '600' }}>Grateful:</span> {entry.reflectionAnchors.gratefulText}</div>}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    marginBottom: '1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--foreground-muted)'
                                }}>
                                    This is your Growth Book
                                </div>
                                <PdfPreview
                                    draft={previewDraft}
                                    entries={previewEntries}
                                    themeName={selectedTheme}
                                    style={{ minHeight: '600px', flex: 1 }}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
                        <button className="btn-primary" style={{ flex: 1, background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }} onClick={() => setStep(4)}>Edit</button>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save to Library</button>
                    </div>

                    {/* Independent PDF Download for Preview */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>Ready to print?</p>
                        <PdfDownloadButton
                            draft={previewDraft}
                            entries={previewEntries}
                            // PASS THE SELECTED THEME HERE
                            themeName={selectedTheme}
                            className="btn-primary"
                            style={{ background: 'var(--primary)', color: 'white', display: 'inline-flex' }}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}
