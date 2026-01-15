"use client";
import Link from 'next/link';
import React from 'react';
import { useJournal } from '@/hooks/useJournal';
import { Card } from '@/components/Card';
import { Calendar } from '@/components/Calendar';

export default function ProgressPage() {
    const { entries, loading, deleteEntry, weeklyReflections, saveWeeklyReflection } = useJournal();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
    const [showDropdown, setShowDropdown] = React.useState(false);

    // Milestone 5
    const [viewMode, setViewMode] = React.useState<'list' | 'weekly'>('list');
    const [showContextPrompt, setShowContextPrompt] = React.useState(true);
    const [contextPrompt, setContextPrompt] = React.useState('');

    React.useEffect(() => {
        const prompts = [
            "What pattern do you notice this week?",
            "What gave you energy repeatedly?",
            "Where did you feel most stuck?",
            "Who supported you the most?"
        ];
        setContextPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }, []);

    const groupedWeeks = React.useMemo(() => {
        const groups: Record<string, typeof entries> = {};
        entries.forEach(entry => {
            const date = new Date(entry.date);
            // Simple Week Key: YYYY-Www
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
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Written today';
        if (diffDays === 1) return 'Written yesterday';
        if (diffDays < 7) return `Written ${diffDays} days ago`;
        if (diffDays < 30) return `Written ${Math.floor(diffDays / 7)} weeks ago`;
        return `Written on ${dateStr}`;
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading journal...</div>;

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "growth-book-journal.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // Filter Logic
    const filteredEntries = entries.filter(entry => {
        // 1. Date Filter
        if (selectedDate && entry.date !== selectedDate) return false;

        // 2. Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const contentMatch = (entry.content || '').toLowerCase().includes(query);
            const promptMatch = (entry.prompt !== 'Free Write') && (entry.prompt || '').toLowerCase().includes(query);
            return contentMatch || promptMatch;
        }

        return true;
    });

    const handleDateSelect = (date: string) => {
        // Toggle selection
        if (selectedDate === date) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date);
        }
    };



    // Dropdown Logic
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowDropdown(true);
    };

    const handleSearchFocus = () => {
        if (searchQuery.trim()) setShowDropdown(true);
    };

    return (
        <div style={{ padding: '2rem 1.5rem', paddingBottom: '100px', minHeight: '100vh', position: 'relative' }} className="animate-fade-in">
            {/* Backdrop for handling outside clicks when dropdown is open */}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Your Journey</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                        href="/curate"
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>Create Journal</span>
                    </Link>
                    <button
                        onClick={handleExport}
                        style={{
                            background: 'none',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Export
                    </button>
                </div>
            </div>

            {/* Contextual Prompt (Milestone 5) */}
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
                                            <span style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' })}:</span>
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

                    {/* Search Bar Container */}
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

                        {/* Dropdown Results */}
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
                                        // If content matches, show snippet of content. Otherwise default to prompt.
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

                    <Calendar
                        datesWithEntries={entries.map(e => e.date)}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                    />

                    {/* Filter Status / Clear */}
                    {(selectedDate || searchQuery) && (
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
                                Showing {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                                {selectedDate && ` from ${selectedDate}`}
                            </span>
                            <button
                                onClick={() => { setSelectedDate(null); setSearchQuery(''); setShowDropdown(false); }}
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
                            {entries.length === 0 ? (
                                <>
                                    <p>No entries yet.</p>
                                    <p>Start your growth journey today!</p>
                                </>
                            ) : (
                                <p>No entries match your filters.</p>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredEntries.sort((a, b) => b.timestamp - a.timestamp).map((entry) => (
                                <div key={entry.id} className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                                            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {/* Reflection Indicators */}
                                            {entry.reflectionAnchors?.excitedText && <span title="Excited">⚡</span>}
                                            {entry.reflectionAnchors?.drainedText && <span title="Drained">🔋</span>}
                                            {entry.reflectionAnchors?.gratefulText && <span title="Grateful">🙏</span>}

                                            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginLeft: '4px' }}>
                                                {getRelativeTime(entry.date)}
                                            </div>
                                        </div>
                                    </div>

                                    {entry.highlight && (
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: 'var(--surface-highlight)',
                                            color: 'var(--primary)',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            marginBottom: '0.5rem',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {entry.highlight.type}
                                        </div>
                                    )}

                                    <div style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                        {entry.prompt}
                                    </div>

                                    <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                                        {entry.content}
                                    </p>

                                    <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
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
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
