import React, { useEffect, useState } from 'react';

/**
 * Editor for a single note.
 * @param {{
 *  note: {id:string,title?:string,content?:string}|null,
 *  onSave: (id:string, patch:{title?:string, content?:string}) => Promise<void>
 * }} props
 */
// PUBLIC_INTERFACE
export default function NoteEditor({ note, onSave }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!note) {
    return (
      <div className="note-editor empty">
        <p>Select a note to start editing.</p>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(note.id, { title, content });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="note-editor">
      <input
        className="note-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        aria-label="Note title"
      />
      <textarea
        className="note-content-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your note..."
        aria-label="Note content"
      />
      <div className="editor-actions">
        <button
          className="btn btn-accent"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
