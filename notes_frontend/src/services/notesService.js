/* eslint-disable no-console */
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'kavia_notes_fallback_v1';

/**
 * Local-only notes persistence fallback when Supabase is not configured.
 * Provides a compatible API to the Supabase-based service.
 */
const LocalNotesService = {
  _load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  _save(notes) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  },
  _now() {
    return new Date().toISOString();
  },

  // PUBLIC_INTERFACE
  /**
   * Fetch all notes ordered by updated_at desc.
   * @returns {Promise<{data: Array, error: null}>}
   */
  async fetchNotes() {
    const items = this._load()
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    return { data: items, error: null };
  },

  // PUBLIC_INTERFACE
  /**
   * Search notes by title or content (case-insensitive)
   * @param {string} query
   * @returns {Promise<{data: Array, error: null}>}
   */
  async searchNotes(query) {
    const q = (query || '').toLowerCase();
    const items = this._load().filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    return { data: items, error: null };
  },

  // PUBLIC_INTERFACE
  /**
   * Create a new note with optional title/content.
   * @param {{title?: string, content?: string}} payload
   * @returns {Promise<{data: Object, error: null}>}
   */
  async createNote(payload = {}) {
    const list = this._load();
    const now = this._now();
    const newNote = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      title: payload.title ?? 'Untitled',
      content: payload.content ?? '',
      created_at: now,
      updated_at: now
    };
    list.unshift(newNote);
    this._save(list);
    return { data: newNote, error: null };
  },

  // PUBLIC_INTERFACE
  /**
   * Update an existing note by id.
   * @param {string} id
   * @param {{title?: string, content?: string}} patch
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  async updateNote(id, patch = {}) {
    const list = this._load();
    const idx = list.findIndex(n => n.id === id);
    if (idx === -1) {
      return { data: null, error: new Error('Note not found') };
    }
    const updated = {
      ...list[idx],
      ...patch,
      updated_at: this._now(),
    };
    list[idx] = updated;
    this._save(list);
    return { data: updated, error: null };
  },

  // PUBLIC_INTERFACE
  /**
   * Delete a note by id.
   * @param {string} id
   * @returns {Promise<{error: Error|null}>}
   */
  async deleteNote(id) {
    const list = this._load();
    const filtered = list.filter(n => n.id !== id);
    this._save(filtered);
    return { error: null };
  }
};

// Supabase-backed implementation
const SupabaseNotesService = {
  table() {
    return supabase.from('notes');
  },

  // PUBLIC_INTERFACE
  /**
   * Fetch all notes ordered by updated_at descending.
   * @returns {Promise<{data: Array, error: any}>}
   */
  async fetchNotes() {
    const { data, error } = await this.table()
      .select('*')
      .order('updated_at', { ascending: false });
    return { data: data || [], error };
  },

  // PUBLIC_INTERFACE
  /**
   * Search notes by title or content using ilike.
   * @param {string} query
   * @returns {Promise<{data: Array, error: any}>}
   */
  async searchNotes(query) {
    const q = (query || '').trim();
    if (!q) return this.fetchNotes();
    const { data, error } = await this.table()
      .select('*')
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order('updated_at', { ascending: false });
    return { data: data || [], error };
  },

  // PUBLIC_INTERFACE
  /**
   * Create a new note.
   * @param {{title?: string, content?: string}} payload
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async createNote(payload = {}) {
    const body = {
      title: payload.title ?? 'Untitled',
      content: payload.content ?? ''
    };
    const { data, error } = await this.table()
      .insert(body)
      .select()
      .single();
    return { data, error };
  },

  // PUBLIC_INTERFACE
  /**
   * Update a note by id.
   * @param {string} id
   * @param {{title?: string, content?: string}} patch
   * @returns {Promise<{data: Object|null, error: any}>}
   */
  async updateNote(id, patch = {}) {
    const updateBody = { ...patch, updated_at: new Date().toISOString() };
    const { data, error } = await this.table()
      .update(updateBody)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // PUBLIC_INTERFACE
  /**
   * Delete a note by id.
   * @param {string} id
   * @returns {Promise<{error: any}>}
   */
  async deleteNote(id) {
    const { error } = await this.table().delete().eq('id', id);
    return { error };
  }
};

// PUBLIC_INTERFACE
/**
 * Exported notes service. Uses Supabase if configured; otherwise localStorage fallback.
 */
export const NotesService = supabase ? SupabaseNotesService : LocalNotesService;
