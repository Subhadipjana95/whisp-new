import { useState, useCallback, useMemo } from 'react';
import type { Note, Reminder } from '../types';

interface UseSearchResult {
  query: string;
  setQuery: (q: string) => void;
  filteredNotes: Note[];
  filteredReminders: Reminder[];
}

export function useSearch(notes: Note[], reminders: Reminder[]): UseSearchResult {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.toLowerCase().trim();

  const filteredNotes = useMemo(() => {
    if (!normalizedQuery) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(normalizedQuery) ||
        n.body.toLowerCase().includes(normalizedQuery)
    );
  }, [notes, normalizedQuery]);

  const filteredReminders = useMemo(() => {
    if (!normalizedQuery) return reminders;
    return reminders.filter(
      (r) =>
        r.title.toLowerCase().includes(normalizedQuery) ||
        r.body.toLowerCase().includes(normalizedQuery)
    );
  }, [reminders, normalizedQuery]);

  const handleSetQuery = useCallback((q: string) => setQuery(q), []);

  return {
    query,
    setQuery: handleSetQuery,
    filteredNotes,
    filteredReminders,
  };
}
