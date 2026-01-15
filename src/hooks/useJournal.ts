"use client";
import { useState, useEffect } from 'react';

export interface Entry {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    prompt: string;
    content: string;
    timestamp: number;
}

const STORAGE_KEY = 'growth_book_entries';

export function useJournal() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setEntries(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse directory", e);
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
            updatedEntries[existingIndex] = { ...updatedEntries[existingIndex], ...entry, timestamp: Date.now() };
        } else {
            updatedEntries = [newEntry, ...entries];
        }

        setEntries(updatedEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    };

    const updateEntry = (entry: Entry) => {
        const updatedEntries = entries.map(e => e.id === entry.id ? { ...entry, timestamp: Date.now() } : e);
        setEntries(updatedEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    };

    const deleteEntry = (id: string) => {
        const updatedEntries = entries.filter(e => e.id !== id);
        setEntries(updatedEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    };

    const getEntryByDate = (date: string) => {
        return entries.find(e => e.date === date);
    };

    const getEntryById = (id: string) => {
        return entries.find(e => e.id === id);
    };

    return { entries, saveEntry, updateEntry, deleteEntry, getEntryByDate, getEntryById, loading };
}
