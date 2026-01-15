"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useJournal } from '@/hooks/useJournal';

function WriteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { saveEntry, updateEntry, getEntryById } = useJournal();

    const [content, setContent] = useState('');
    const [prompt, setPrompt] = useState('Free Write');
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get('id');
        const p = searchParams.get('prompt');

        if (id) {
            setEditId(id);
            const existing = getEntryById(id);
            if (existing) {
                setContent(existing.content);
                setPrompt(existing.prompt);
            }
        } else if (p) {
            setPrompt(p);
        }
    }, [searchParams, getEntryById]);

    const handleSave = () => {
        if (!content.trim()) return;
        setLoading(true);

        // Simulate slight delay for "app feel"
        setTimeout(() => {
            if (editId) {
                // If we have an ID, we strictly need to reconstruct the full Entry object
                // But our hook method expects the specific fields. 
                // Let's grab the full existing object to be safe, or just pass what updateEntry needs.
                // Looking at useJournal, updateEntry expects a full Entry.
                const existing = getEntryById(editId);
                if (existing) {
                    updateEntry({
                        ...existing,
                        content: content
                    });
                }
            } else {
                saveEntry({
                    date: new Date().toISOString().split('T')[0],
                    prompt: prompt,
                    content: content
                });
            }
            setLoading(false);
            router.push('/progress');
        }, 500);
    };

    return (
        <div style={{ padding: '2rem 1.5rem', paddingBottom: '100px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>Writing about:</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary)', lineHeight: '1.4' }}>
                    {prompt}
                </h2>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing here..."
                style={{
                    flex: 1,
                    width: '100%',
                    border: 'none',
                    resize: 'none',
                    fontSize: '1.125rem',
                    lineHeight: '1.6',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: 'var(--foreground)',
                }}
                autoFocus
            />

            <button
                onClick={handleSave}
                disabled={!content.trim() || loading}
                style={{
                    marginTop: 'auto',
                    backgroundColor: content.trim() ? 'var(--primary)' : '#ccc',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '50px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    border: 'none',
                    width: '100%',
                    cursor: content.trim() ? 'pointer' : 'default',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                {loading ? 'Saving...' : (editId ? 'Update Entry' : 'Save Entry')}
            </button>
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
