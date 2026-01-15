"use client";
import { useState, useEffect } from 'react';

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

    const saveEntry = (entry: Omit<Entry, 'id' | 'timestamp'>) => {
        const newEntry: Entry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };

        // Check if entry for this date already exists, if so update it
        const existingIndex = entries.findIndex(e => e.date === entry.date);
        let updatedEntries;

        if (existingIndex >= 0) {
            updatedEntries = [...entries];
            // Merge functionality to preserve partial updates if needed, though here we likely overwrite
            // But let's be safe and assume we intend to overwrite the day's primary entry
            updatedEntries[existingIndex] = { ...updatedEntries[existingIndex], ...entry, timestamp: Date.now() };
        } else {
            updatedEntries = [newEntry, ...entries];
        }

        setEntries(updatedEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    };

    const updateEntry = (entry: Entry) => {
        const updatedEntries = entries.map(e => e.id === entry.id ? { ...e, ...entry, timestamp: Date.now() } : e);
        setEntries(updatedEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    };

    const deleteEntry = (id: string) => {
        const updatedEntries = entries.filter(e => e.id !== id);
        setEntries(updatedEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    };

    const saveWeeklyReflection = (weekId: string, content: string) => {
        const timestamp = Date.now();
        const existingIndex = weeklyReflections.findIndex(w => w.weekId === weekId);
        let updatedReflections;

        if (existingIndex >= 0) {
            updatedReflections = [...weeklyReflections];
            updatedReflections[existingIndex] = { weekId, content, timestamp };
        } else {
            updatedReflections = [...weeklyReflections, { weekId, content, timestamp }];
        }

        setWeeklyReflections(updatedReflections);
        localStorage.setItem(WEEKLY_REFLECTIONS_KEY, JSON.stringify(updatedReflections));
    };

    const getEntryByDate = (date: string) => {
        return entries.find(e => e.date === date);
    };

    const getEntryById = (id: string) => {
        return entries.find(e => e.id === id);
    };

    const getWeeklyReflection = (weekId: string) => {
        return weeklyReflections.find(w => w.weekId === weekId);
    };

    const saveDraft = (draft: JournalDraft) => {
        const updatedDrafts = [...drafts.filter(d => d.id !== draft.id), draft];
        setDrafts(updatedDrafts);
        localStorage.setItem(JOURNAL_DRAFTS_KEY, JSON.stringify(updatedDrafts));
    };

    const deleteDraft = (id: string) => {
        const updatedDrafts = drafts.filter(d => d.id !== id);
        setDrafts(updatedDrafts);
        localStorage.setItem(JOURNAL_DRAFTS_KEY, JSON.stringify(updatedDrafts));
    };

    return {
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
        deleteDraft
    };
}
