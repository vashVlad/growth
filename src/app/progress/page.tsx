"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useJournal } from '@/hooks/useJournal';
import { ContextualHelp } from '@/components/ContextualHelp';
import { getLocalDateISOString, getSafeDate, formatDateForDisplay } from '@/utils/date';
import { Card } from '@/components/Card';
import { Calendar } from '@/components/Calendar';

export default function ProgressPage() {
    const { entries, loading, deleteEntry, weeklyReflections, saveWeeklyReflection, exportBackup, importBackup } = useJournal();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const router = useRouter();

    // Milestone 5
    const [viewMode, setViewMode] = React.useState<'list' | 'weekly'>('list');
    const [showContextPrompt, setShowContextPrompt] = React.useState(true);
    const [contextPrompt, setContextPrompt] = React.useState('');

    // Milestone 7.2: Import Stats
    const [importStats, setImportStats] = React.useState<{ added: number; updated: number; skipped: number } | null>(null);
    const [pendingBackup, setPendingBackup] = React.useState<any | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Milestone 10.2: Mode Filter
    const [filterMode, setFilterMode] = React.useState<'all' | 'purpose' | 'growth'>('all');

    const pendingEntryCount = (pendingBackup?.data?.entries || []).length;
    const pendingDraftCount = (pendingBackup?.data?.drafts || []).length;

    React.useEffect(() => {
        const prompts = [
            "What pattern do you notice this week?",
            "What gave you energy repeatedly?",
            "Where did you feel most stuck?",
            "Who supported you the most?"
        ];
        setContextPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }, []);

    // ... (keep groupedWeeks and getRelativeTime helpers)
    const groupedWeeks = React.useMemo(() => {
        const groups: Record<string, typeof entries> = {};
        entries.forEach(entry => {
            const date = getSafeDate(entry.date);
            const startOfYear = new Date(date.getFullYear(), 0, 1);
            const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
            const weekNum = Math.ceil((date.getDay() + 1 + days) / 7);
            const key = `${date.getFullYear()}-W${weekNum}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(entry);
        });
        return groups;
    }, [entries]);

    const getRelativeTime = (dateStr: string) => {
        const date = getSafeDate(dateStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); // Compare noons
        const diffTime = Math.abs(today.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Written today';
        if (diffDays === 1) return 'Written yesterday';
        if (diffDays < 7) return `Written ${diffDays} days ago`;
        if (diffDays < 30) return `Written ${Math.floor(diffDays / 7)} weeks ago`;
        return `Written on ${formatDateForDisplay(dateStr)}`;
    };

    // Loading check moved to render to preserve hook order



    // Filter Logic - Memoized
    const filteredEntries = React.useMemo(() => {
        return entries.filter(entry => {
            // 1. Date Filter
            if (selectedDate && entry.date !== selectedDate) return false;

            // 2. Search Filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const contentMatch = (entry.content || '').toLowerCase().includes(query);
                const promptMatch = (entry.prompt !== 'Free Write') && (entry.prompt || '').toLowerCase().includes(query);
                if (!contentMatch && !promptMatch) return false;
            }

            // 3. Mode Filter (Purpose vs Growth)
            if (filterMode === 'purpose') {
                // "Purpose" corresponds to 'free' mode or legacy entries (undefined)
                return entry.reflectionMode === 'free' || !entry.reflectionMode;
            }
            if (filterMode === 'growth') {
                return entry.reflectionMode === 'growth';
            }

            return true;
        });
    }, [entries, selectedDate, searchQuery, filterMode]);

    // Group entries for "List View" (Memoized)
    // We lift this state up from the render function to avoid recalculation
    const sections = React.useMemo(() => {
        const groups: Record<string, typeof entries> = {
            'Today': [],
            'Yesterday': [],
            'This Week': [],
            'Older': []
        };

        const todayStr = getLocalDateISOString(); // Use helper for consistency
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Helper to check if date is in "This Week" (last 7 days excluding today/yesterday)
        const isThisWeek = (dateStr: string) => {
            const d = new Date(dateStr);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - d.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 1 && diffDays <= 7;
        };

        filteredEntries.forEach(entry => {
            if (entry.date === todayStr) {
                groups['Today'].push(entry);
            } else if (entry.date === yesterdayStr) {
                groups['Yesterday'].push(entry);
            } else if (isThisWeek(entry.date)) {
                groups['This Week'].push(entry);
            } else {
                groups['Older'].push(entry);
            }
        });

        return groups;
    }, [filteredEntries]);

    const handleDateSelect = (date: string) => {
        if (selectedDate === date) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowDropdown(true);
    };

    const handleSearchFocus = () => {
        if (searchQuery.trim()) setShowDropdown(true);
    };

    // Restore Logic
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Pre-calculate stats without applying
                // We'll replicate the logic slightly just for display, or assume the user wants to see what WOULD happen.
                // Actually, `importBackup` currently APPLIES changes.
                // To do "Preview", we need to separate logic or just perform a "Dry Run".
                // For now, let's just count total entries in backup vs local. AS per requirements: "Show number of entries in backup, number of drafts, etc."

                const backupEntries = json.data?.entries?.length || 0;
                const backupDrafts = json.data?.drafts?.length || 0;

                // Let's store the JSON to apply later
                setPendingBackup(json);
            } catch (err) {
                alert("Invalid backup file.");
            }
        };
        reader.readAsText(file);
    };

    const confirmRestore = () => {
        if (pendingBackup) {
            const stats = importBackup(pendingBackup);
            setImportStats(stats);
            setPendingBackup(null); // Close preview, show result

            // Auto hide success after 3s
            setTimeout(() => setImportStats(null), 4000);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading journal...</div>;

    return (
        <div style={{ padding: '2rem 1.5rem', paddingBottom: '100px', minHeight: '100vh', position: 'relative' }} className="animate-fade-in">
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileSelect}
            />

            {/* Restore Preview Modal */}
            {pendingBackup && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <Card style={{ maxWidth: '400px', width: '100%' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Restore Backup?</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>
                            We found <strong>{pendingEntryCount} entries</strong> and <strong>{pendingDraftCount} drafts</strong> in this file.
                        </p>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                            We will merge these with your current journal. Newer versions of entries will be kept. Nothing will be lost.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-primary" onClick={() => setPendingBackup(null)} style={{ background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)', flex: 1 }}>Cancel</button>
                            <button className="btn-primary" onClick={confirmRestore} style={{ flex: 1 }}>Confirm Restore</button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Success Toast */}
            {importStats && (
                <div style={{
                    position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '50px',
                    boxShadow: 'var(--shadow-md)', zIndex: 1000, textAlign: 'center'
                }} className="animate-fade-in">
                    <strong>Restore Complete</strong><br />
                    <span style={{ fontSize: '0.875rem' }}>{importStats.added} new, {importStats.updated} updated, {importStats.skipped} skipped.</span>
                </div>
            )}

            {showDropdown && searchQuery.trim().length > 0 && (
                <div
                    onClick={() => setShowDropdown(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 40,
                        background: 'transparent'
                    }}
                />
            )}

            <div style={{ marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                {/* 1. H1 Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Your Journey</h1>
                    <ContextualHelp
                        title="Your Journey"
                        color="var(--primary)"
                        content="Progress isn't about productivity—it's about understanding. Looking back at your own words helps you notice patterns, see how you've grown, and connect the dots over time. Read your entries with curiosity, not judgment."
                    />
                </div>

                {/* 2. Reflection Spark */}
                {showContextPrompt && contextPrompt && (
                    <div className="card animate-fade-in" style={{ marginBottom: '1.5rem', borderTop: '4px solid var(--accent)', background: 'var(--surface-highlight)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>✨</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold' }}>Reflection Spark</div>
                            <div style={{ fontSize: '1rem', color: 'var(--foreground)', marginTop: '4px' }}>{contextPrompt}</div>
                        </div>
                        <button onClick={() => setShowContextPrompt(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--foreground-muted)', padding: '0.5rem', lineHeight: 1 }}>×</button>
                    </div>
                )}

                {/* 3. Search Bar */}
                <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 50 }}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="search"
                            placeholder="Search entries..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                            autoComplete="off"
                            className="input-field"
                        />
                    </form>

                    {showDropdown && searchQuery.trim().length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'var(--surface)',
                            borderRadius: '0 0 12px 12px',
                            boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--border)',
                            borderTop: 'none',
                            marginTop: '-10px',
                            paddingTop: '10px',
                            zIndex: 100,
                            overflow: 'hidden',
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }}>
                            {filteredEntries.length > 0 ? (
                                filteredEntries.slice(0, 5).map(entry => {
                                    const lowerQuery = searchQuery.toLowerCase();
                                    const contentMatches = (entry.content || '').toLowerCase().includes(lowerQuery);
                                    const displayText = (contentMatches && entry.content) ? entry.content : (entry.prompt || entry.content);

                                    return (
                                        <Link
                                            key={entry.id}
                                            href={`/write?id=${entry.id}`}
                                            onClick={() => setShowDropdown(false)}
                                            style={{
                                                display: 'block',
                                                padding: '0.75rem 1rem',
                                                borderBottom: '1px solid var(--border)',
                                                color: 'var(--foreground)',
                                                textDecoration: 'none',
                                                transition: 'background-color 0.1s'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                {entry.date}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--foreground-muted)' }}>
                                                {displayText.substring(0, 50)}
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
                                    No matches found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Calendar */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <Calendar
                        datesWithEntries={entries.map(e => e.date)}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                    />
                </div>

                {/* 5. Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                    <Link
                        href="/curate"
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: '100%'
                        }}
                    >
                        <span>Create Journal</span>
                    </Link>
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button
                            onClick={exportBackup}
                            style={{
                                flex: 1,
                                background: 'none',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                padding: '0.75rem 0.5rem',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            Backup
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flex: 1,
                                background: 'none',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                padding: '0.75rem 0.5rem',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            Restore
                        </button>
                    </div>
                </div>

                {/* 6. Migration Help */}
                <details style={{ marginBottom: '1.5rem', color: 'var(--foreground-muted)', fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                    <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: '600', userSelect: 'none', textAlign: 'center' }}>Switching to a new device?</summary>
                    <div style={{ padding: '1rem', background: 'var(--surface-highlight)', borderRadius: '8px', lineHeight: '1.6', marginTop: '0.5rem' }}>
                        <p style={{ marginBottom: '0.5rem' }}>We don't store your data on any server—it lives right here on this device. To move it:</p>
                        <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
                            <li style={{ marginBottom: '0.5rem' }}>Tap <strong>Backup</strong> above to save your journal file.</li>
                            <li style={{ marginBottom: '0.5rem' }}>Send that backup file to your new device (email, AirDrop, etc.).</li>
                            <li>Open this app on the new device, tap <strong>Restore</strong>, and select the file.</li>
                        </ol>
                    </div>
                </details>
            </div>

            {/* Spark moved to top */}

            {viewMode === 'weekly' ? (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {Object.entries(groupedWeeks).sort().reverse().map(([weekKey, weekEntries]) => {
                        const reflection = weeklyReflections.find(w => w.weekId === weekKey);
                        return (
                            <Card key={weekKey}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--primary)' }}>
                                    Week {weekKey.split('-W')[1]}, {weekKey.split('-W')[0]}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {weekEntries.map(e => (
                                        <div key={e.id} style={{ fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                                            <span style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{getSafeDate(e.date).toLocaleDateString('en-US', { weekday: 'short' })}:</span>
                                            <span style={{ color: 'var(--foreground-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {e.highlight?.type ? `[${e.highlight.type.toUpperCase()}] ` : ''}
                                                {e.content.substring(0, 40)}...
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.5rem' }}>
                                        Weekly Reflection
                                    </label>
                                    <textarea
                                        className="input-field"
                                        placeholder="How was this week overall?"
                                        defaultValue={reflection?.content || ''}
                                        onBlur={(e) => saveWeeklyReflection(weekKey, e.target.value)}
                                        style={{ width: '100%', minHeight: '80px' }}
                                    />
                                </div>
                            </Card>
                        );
                    })}
                    {Object.keys(groupedWeeks).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)' }}>
                            No entries to group yet.
                        </div>
                    )}
                </div>
            ) : (
                <>



                    {/* Reflection History Header */}
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--foreground)', marginTop: '0' }}>Reflection History</h2>

                    {/* Mode Filter Toggle */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                        {(['all', 'purpose', 'growth'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setFilterMode(mode)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border)',
                                    background: filterMode === mode ? 'var(--primary)' : 'transparent',
                                    color: filterMode === mode ? 'white' : 'var(--foreground-muted)',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Filter Status / Clear */}
                    {(selectedDate || searchQuery || filterMode !== 'all') && (
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                                Showing {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                                {selectedDate && ` from ${selectedDate}`}
                            </span>
                            <button
                                onClick={() => { setSelectedDate(null); setSearchQuery(''); setShowDropdown(false); setFilterMode('all'); }}
                                style={{ fontSize: '0.875rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {filteredEntries.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--foreground-muted)', marginTop: '3rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                {entries.length === 0 ? '🍃' : '🔍'}
                            </div>

                            {/* Empty State Logic */}
                            {entries.length === 0 ? (
                                <>
                                    <p>No entries yet.</p>
                                    <p>Start your growth journey today!</p>
                                </>
                            ) : selectedDate && filteredEntries.length === 0 ? (
                                // Logic for Selected Date with No Entries
                                (() => {
                                    const today = getLocalDateISOString();
                                    const isFuture = selectedDate > today;

                                    return (
                                        <div className="animate-fade-in">
                                            <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>
                                                No entry for {formatDateForDisplay(selectedDate)}
                                            </p>

                                            {isFuture ? (
                                                <div style={{
                                                    background: 'var(--surface-highlight)',
                                                    padding: '1rem',
                                                    borderRadius: '8px',
                                                    maxWidth: '300px',
                                                    margin: '0 auto',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    ⏳ You cannot write entries for future dates.
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => router.push(`/write?date=${selectedDate}`)}
                                                    className="btn-primary"
                                                    style={{
                                                        padding: '0.75rem 1.5rem',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    ✍️ Write Entry for this Day
                                                </button>
                                            )}
                                        </div>
                                    );
                                })()
                            ) : (
                                <p>No entries match your filters.</p>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Group entries by section */
                                Object.entries(sections).map(([title, sectionEntries]) => {
                                    if (sectionEntries.length === 0) return null;
                                    return (
                                        <div key={title} className="animate-fade-in">
                                            <h3 style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                color: 'var(--foreground-muted)',
                                                marginBottom: '1rem',
                                                marginTop: '0.5rem'
                                            }}>
                                                {title}
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {sectionEntries.map(entry => (
                                                    <div key={entry.id} className="card" style={{ padding: '1.25rem' }}>
                                                        {/* Line 1: Date & Icons */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                                                                {formatDateForDisplay(entry.date)}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                {entry.highlight && (
                                                                    <div style={{
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        background: 'var(--surface-highlight)',
                                                                        color: 'var(--primary)',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 'bold',
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.05em'
                                                                    }}>
                                                                        {entry.highlight.type}
                                                                    </div>
                                                                )}
                                                                {entry.reflectionAnchors?.excitedText && <span title="Excited">⚡</span>}
                                                                {entry.reflectionAnchors?.drainedText && <span title="Drained">🔋</span>}
                                                                {entry.reflectionAnchors?.gratefulText && <span title="Grateful">🙏</span>}
                                                            </div>
                                                        </div>

                                                        {/* Line 2: Excerpt */}
                                                        <p style={{
                                                            fontSize: '1rem',
                                                            lineHeight: '1.5',
                                                            color: 'var(--foreground)',
                                                            marginBottom: '0.75rem',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {(entry.content || "").replace(/\s+/g, ' ') || <span style={{ color: 'var(--foreground-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No free write yet</span>}
                                                        </p>

                                                        {/* Line 3: Type Label & Actions */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light, rgba(0,0,0,0.05))' }}>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                                                                {entry.reflectionMode === 'growth' ? 'Growth Reflection' : 'Purpose Reflection'}
                                                            </div>

                                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                                <Link href={`/write?id=${entry.id}`} style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('Are you sure you want to delete this entry?')) {
                                                                            deleteEntry(entry.id);
                                                                        }
                                                                    }}
                                                                    style={{ background: 'none', border: 'none', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--foreground-muted)' }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.75rem', color: 'var(--foreground-muted)', opacity: 0.7 }}>
                        Your journal is stored on this device. Deleting the app will remove it unless you back it up.
                    </div>
                </>
            )}
        </div>
    );
}
