"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Entry {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    prompt: string;
    content: string;
    timestamp: number;
    reflectionAnchors?: {
        whatStayed?: string;
        perspectiveChange?: string;
        excitedText?: string;
        drainedText?: string;
        gratefulText?: string;
    };

    highlight?: {
        type: 'breakthrough' | 'win' | 'loss';
        note?: string; // "Why this mattered" or "Lesson learned"
    };

    // Milestone 10: Dual Writing Modes
    reflectionMode?: 'free' | 'growth';
    learnedText?: string;
    alignmentText?: string;
    improveTomorrowText?: string;
}

export interface WeeklyReflection {
    weekId: string; // "2023-W43"
    content: string;
    timestamp: number;
}

export interface JournalDraft {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    intent: string;

    // Selection Rules (Snapshot)
    criteria: {
        startDate?: string;
        endDate?: string;
        includeHighlights: boolean;
    };

    // The Content
    includedEntryIds: string[]; // List of IDs curated by the user

    // Structure Configuration
    sections: {
        id: string; // 'opening', 'breakthroughs', 'wins', 'losses', 'chronological'
        title: string; // User renamable
        order: number;
    }[];
}

const STORAGE_KEY = 'growth_book_entries';
const WEEKLY_REFLECTIONS_KEY = 'growth_book_weekly_reflections';
const JOURNAL_DRAFTS_KEY = 'growth_book_journal_drafts';

// Utility for safe UUID generation across all environments (including non-secure HTTP PWA)
function safeUUID(): string {
    // 1. Try native crypto.randomUUID (Secure Contexts only)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        try {
            return crypto.randomUUID();
        } catch (e) {
            // Check failed, proceed to fallback
        }
    }

    // 2. Try crypto.getRandomValues (Legacy / some browsers)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        try {
            return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: string) =>
                (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)
            );
        } catch (e) {
            // Check failed
        }
    }

    // 3. Last resort: Date.now() + Math.random() (Non-secure/Backup)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function useJournal() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflection[]>([]);
    const [drafts, setDrafts] = useState<JournalDraft[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load Entries
        const storedEntries = localStorage.getItem(STORAGE_KEY);
        if (storedEntries) {
            try {
                setEntries(JSON.parse(storedEntries));
            } catch (e) {
                console.error("Failed to parse entries", e);
            }
        }

        // Load Weekly Reflections
        const storedReflections = localStorage.getItem(WEEKLY_REFLECTIONS_KEY);
        if (storedReflections) {
            try {
                setWeeklyReflections(JSON.parse(storedReflections));
            } catch (e) {
                console.error("Failed to parse weekly reflections", e);
            }
        }

        // Load Journal Drafts
        const storedDrafts = localStorage.getItem(JOURNAL_DRAFTS_KEY);
        if (storedDrafts) {
            try {
                setDrafts(JSON.parse(storedDrafts));
            } catch (e) {
                console.error("Failed to parse journal drafts", e);
            }
        }

        setLoading(false);
    }, []);

    const saveEntry = useCallback((entry: Omit<Entry, 'id' | 'timestamp'>) => {
        const newEntry: Entry = {
            ...entry,
            id: safeUUID(),
            timestamp: Date.now(),
        };

        setEntries(prevEntries => {
            // Check if entry for this date already exists, if so update it
            const existingIndex = prevEntries.findIndex(e => e.date === entry.date);
            let updatedEntries;

            if (existingIndex >= 0) {
                updatedEntries = [...prevEntries];
                updatedEntries[existingIndex] = { ...updatedEntries[existingIndex], ...entry, timestamp: Date.now() };
            } else {
                updatedEntries = [newEntry, ...prevEntries];
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
            return updatedEntries;
        });
    }, []);

    const updateEntry = useCallback((entry: Entry) => {
        setEntries(prevEntries => {
            const updatedEntries = prevEntries.map(e => e.id === entry.id ? { ...e, ...entry, timestamp: Date.now() } : e);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
            return updatedEntries;
        });
    }, []);

    const deleteEntry = useCallback((id: string) => {
        setEntries(prevEntries => {
            const updatedEntries = prevEntries.filter(e => e.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
            return updatedEntries;
        });
    }, []);

    const saveWeeklyReflection = useCallback((weekId: string, content: string) => {
        const timestamp = Date.now();
        setWeeklyReflections(prevReflections => {
            const existingIndex = prevReflections.findIndex(w => w.weekId === weekId);
            let updatedReflections;

            if (existingIndex >= 0) {
                updatedReflections = [...prevReflections];
                updatedReflections[existingIndex] = { weekId, content, timestamp };
            } else {
                updatedReflections = [...prevReflections, { weekId, content, timestamp }];
            }
            localStorage.setItem(WEEKLY_REFLECTIONS_KEY, JSON.stringify(updatedReflections));
            return updatedReflections;
        });
    }, []);

    const getEntryByDate = useCallback((date: string) => {
        return entries.find(e => e.date === date);
    }, [entries]);

    const getEntryById = useCallback((id: string) => {
        return entries.find(e => e.id === id);
    }, [entries]);

    const getWeeklyReflection = useCallback((weekId: string) => {
        return weeklyReflections.find(w => w.weekId === weekId);
    }, [weeklyReflections]);

    const saveDraft = useCallback((draft: JournalDraft) => {
        setDrafts(prevDrafts => {
            const updatedDrafts = [...prevDrafts.filter(d => d.id !== draft.id), draft];
            localStorage.setItem(JOURNAL_DRAFTS_KEY, JSON.stringify(updatedDrafts));
            return updatedDrafts;
        });
    }, []);

    const deleteDraft = useCallback((id: string) => {
        setDrafts(prevDrafts => {
            const updatedDrafts = prevDrafts.filter(d => d.id !== id);
            localStorage.setItem(JOURNAL_DRAFTS_KEY, JSON.stringify(updatedDrafts));
            return updatedDrafts;
        });
    }, []);

    const exportBackup = useCallback(() => {
        // Note: This relies on current state closures, which is fine for an occasional action.
        // To be perfectly safe, we should use refs or ensure this is only called when entries/etc are fresh.
        // But since we are inside the hook, 'entries' here IS the current render's entries.
        // Only potential issue is if this function is memoized with stale deps.
        // We will include deps.
        const backupData = {
            metadata: {
                exportDate: new Date().toISOString(),
                appVersion: '0.1.0',
                schemaVersion: 1,
                themePreference: localStorage.getItem('theme') as 'light' | 'dark' | null
            },
            data: {
                entries,
                weeklyReflections,
                drafts
            }
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `growth-book-backup-${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }, [entries, weeklyReflections, drafts]);

    const importBackup = useCallback((backup: any): { added: number; updated: number; skipped: number } => {
        if (!backup.data) throw new Error("Invalid backup format");

        let added = 0;
        let updated = 0;
        let skipped = 0;

        // Note: For import, we need access to the current state to merge.
        // Using callbacks with functional updates is tricky for complex logic like this 
        // because we need to read AND write. The cleanest way here is to rely on the current 'entries' closure
        // but that means importBackup changes whenever entries changes. That's acceptable.

        // Actually, we can do it purely functionally if we want absolute stability, but the merge logic is complex.
        // Let's stick to dependency on state for now, but ensure it's in the dependency array.

        // 1. Merge Entries
        const backupEntries: Entry[] = backup.data.entries || [];
        setEntries(currentEntries => {
            const newEntries = [...currentEntries];
            backupEntries.forEach(remote => {
                const localIndex = newEntries.findIndex(e => e.id === remote.id);
                if (localIndex === -1) {
                    newEntries.push(remote);
                    added++;
                } else {
                    const local = newEntries[localIndex];
                    if ((remote.timestamp || 0) > (local.timestamp || 0)) {
                        newEntries[localIndex] = remote;
                        updated++;
                    } else {
                        skipped++;
                    }
                }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
            return newEntries;
        });


        // 2. Merge Weekly Reflections
        const backupReflections: WeeklyReflection[] = backup.data.weeklyReflections || [];
        setWeeklyReflections(currentReflections => {
            const newReflections = [...currentReflections];
            backupReflections.forEach(remote => {
                const localIndex = newReflections.findIndex(w => w.weekId === remote.weekId);
                if (localIndex === -1) {
                    newReflections.push(remote);
                } else {
                    const local = newReflections[localIndex];
                    if ((remote.timestamp || 0) > (local.timestamp || 0)) {
                        newReflections[localIndex] = remote;
                    }
                }
            });
            localStorage.setItem(WEEKLY_REFLECTIONS_KEY, JSON.stringify(newReflections));
            return newReflections;
        });

        // 3. Merge Drafts
        const backupDrafts: JournalDraft[] = backup.data.drafts || [];
        setDrafts(currentDrafts => {
            const newDrafts = [...currentDrafts];
            backupDrafts.forEach(remote => {
                const localIndex = newDrafts.findIndex(d => d.id === remote.id);
                if (localIndex === -1) {
                    newDrafts.push(remote);
                } else {
                    const local = newDrafts[localIndex];
                    if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
                        newDrafts[localIndex] = remote;
                    }
                }
            });
            localStorage.setItem(JOURNAL_DRAFTS_KEY, JSON.stringify(newDrafts));
            return newDrafts;
        });

        // Restore theme if set
        if (backup.metadata?.themePreference) {
            localStorage.setItem('theme', backup.metadata.themePreference);
            if (backup.metadata.themePreference === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
            }
        }

        return { added, updated, skipped };
    }, []); // Removed state dependencies because we used functional updates for setters! 
    // WAIT: The stats 'added/updated/skipped' need to be returned synchronously.
    // With functional updates, we calculate inside the setter, so we can't easily return them.
    // Correction: For importBackup, we DO need to read the current state to compute the diff stats to return.
    // So we MUST depend on entries... OR we redesign importBackup to return a Promise or void.
    // BUT: The existing API returns the stats immediately.
    // So: We must keep 'entries' in the dependency array for this function.
    // It's an "Import" action, rarely used, so re-creating it is fine.

    // Correction 2: Re-implementing importBackup with dependencies to match original signature + behavior.
    const importBackupWithDeps = useCallback((backup: any): { added: number; updated: number; skipped: number } => {
        if (!backup.data) throw new Error("Invalid backup format");

        let added = 0;
        let updated = 0;
        let skipped = 0;

        // 1. Merge Entries
        const newEntries = [...entries];
        const backupEntries: Entry[] = backup.data.entries || [];

        backupEntries.forEach(remote => {
            const localIndex = newEntries.findIndex(e => e.id === remote.id);
            if (localIndex === -1) {
                newEntries.push(remote);
                added++;
            } else {
                const local = newEntries[localIndex];
                if ((remote.timestamp || 0) > (local.timestamp || 0)) {
                    newEntries[localIndex] = remote;
                    updated++;
                } else {
                    skipped++;
                }
            }
        });

        // 2. Merge Weekly Reflections
        const newReflections = [...weeklyReflections];
        const backupReflections: WeeklyReflection[] = backup.data.weeklyReflections || [];

        backupReflections.forEach(remote => {
            const localIndex = newReflections.findIndex(w => w.weekId === remote.weekId);
            if (localIndex === -1) {
                newReflections.push(remote);
            } else {
                const local = newReflections[localIndex];
                if ((remote.timestamp || 0) > (local.timestamp || 0)) {
                    newReflections[localIndex] = remote;
                }
            }
        });

        // 3. Merge Drafts
        const newDrafts = [...drafts];
        const backupDrafts: JournalDraft[] = backup.data.drafts || [];

        backupDrafts.forEach(remote => {
            const localIndex = newDrafts.findIndex(d => d.id === remote.id);
            if (localIndex === -1) {
                newDrafts.push(remote);
            } else {
                const local = newDrafts[localIndex];
                if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
                    newDrafts[localIndex] = remote;
                }
            }
        });


        // Commit
        setEntries(newEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));

        setWeeklyReflections(newReflections);
        localStorage.setItem(WEEKLY_REFLECTIONS_KEY, JSON.stringify(newReflections));

        setDrafts(newDrafts);
        localStorage.setItem(JOURNAL_DRAFTS_KEY, JSON.stringify(newDrafts));

        // Restore theme if set
        if (backup.metadata?.themePreference) {
            localStorage.setItem('theme', backup.metadata.themePreference);
            if (backup.metadata.themePreference === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
            }
        }

        return { added, updated, skipped };
    }, [entries, weeklyReflections, drafts]);


    // Memoize the return value to ensure stable identity when state doesn't change
    // Note: getEntryByDate/ById depend on entries, so they will change when entries change.
    // This is expected. But saveEntry etc will NOT change now.
    return useMemo(() => ({
        entries,
        loading,
        saveEntry,
        updateEntry,
        deleteEntry,
        getEntryByDate,
        getEntryById,
        weeklyReflections,
        saveWeeklyReflection,
        getWeeklyReflection,
        drafts,
        saveDraft,
        deleteDraft,
        exportBackup,
        importBackup: importBackupWithDeps
    }), [
        entries, loading, weeklyReflections, drafts,
        saveEntry, updateEntry, deleteEntry, saveWeeklyReflection, saveDraft, deleteDraft,
        getEntryByDate, getEntryById, getWeeklyReflection, exportBackup, importBackupWithDeps
    ]);
}
