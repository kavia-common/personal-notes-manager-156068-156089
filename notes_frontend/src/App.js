import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { NotesService } from './services/notesService';

// PUBLIC_INTERFACE
/**
 * Root application for the Notes App.
 * Provides:
 * - Sidebar navigation and search
 * - Note list
 * - Note editor with CRUD actions
 * Integrates with Supabase if configured via env variables, otherwise falls back to localStorage.
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const selectedNote = useMemo(
    () => notes.find(n => n.id === selectedId) || null,
    [notes, selectedId]
  );

  async function loadNotes(currentSearch = '') {
    setLoading(true);
    setErrorMsg('');
    try {
      const fn = currentSearch?.trim() ? NotesService.searchNotes : NotesService.fetchNotes;
      const { data, error } = await fn.call(NotesService, currentSearch);
      if (error) throw error;
      setNotes(data || []);
      // keep selection if exists; otherwise select first
      if (data?.length && (!selectedId || !data.find(n => n.id === selectedId))) {
        setSelectedId(data[0].id);
      }
      if (!data?.length) {
        setSelectedId(null);
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      loadNotes(search);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // PUBLIC_INTERFACE
  /**
   * Toggle light/dark theme.
   */
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // PUBLIC_INTERFACE
  /**
   * Create a new note and select it.
   */
  const handleCreate = async () => {
    try {
      const { data, error } = await NotesService.createNote({ title: 'Untitled', content: '' });
      if (error) throw error;
      setNotes(prev => [data, ...prev]);
      setSelectedId(data.id);
      setSearch(''); // reset to show full list
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to create note');
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Persist a note's changes.
   * @param {string} id
   * @param {{title?:string, content?:string}} patch
   */
  const handleSave = async (id, patch) => {
    try {
      const { data, error } = await NotesService.updateNote(id, patch);
      if (error) throw error;
      setNotes(prev => prev.map(n => (n.id === id ? (data || { ...n, ...patch }) : n)));
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to save note');
    }
  };

  // PUBLIC_INTERFACE
  /**
   * Delete a note by id and manage selection.
   * @param {string} id
   */
  const handleDelete = async (id) => {
    const confirm = window.confirm('Delete this note? This action cannot be undone.');
    if (!confirm) return;
    try {
      const { error } = await NotesService.deleteNote(id);
      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedId === id) {
        const remaining = notes.filter(n => n.id !== id);
        setSelectedId(remaining[0]?.id || null);
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to delete note');
    }
  };

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <div className="content">
        <Sidebar
          onCreate={handleCreate}
          search={search}
          onSearchChange={setSearch}
        />
        <main className="main">
          <section aria-label="Note list">
            {errorMsg ? <div className="error" role="alert">{errorMsg}</div> : null}
            {loading ? <div className="loading">Loading...</div> : null}
            <NoteList
              notes={notes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          </section>
          <section aria-label="Editor">
            <NoteEditor note={selectedNote} onSave={handleSave} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
