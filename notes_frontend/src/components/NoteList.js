import React from 'react';

/**
 * Renders a list of notes with simple metadata and actions.
 * @param {{
 *  notes: Array<{id:string,title:string,content:string,updated_at?:string,created_at?:string}>,
 *  selectedId: string|null,
 *  onSelect: (id:string) => void,
 *  onDelete: (id:string) => void
 * }} props
 */
// PUBLIC_INTERFACE
export default function NoteList({ notes, selectedId, onSelect, onDelete }) {
  if (!notes?.length) {
    return (
      <div className="note-list empty">
        <p>No notes yet. Create your first note to get started.</p>
      </div>
    );
  }

  return (
    <div className="note-list" role="list" aria-label="Notes">
      {notes.map((note) => (
        <article
          key={note.id}
          role="listitem"
          tabIndex={0}
          className={`note-list-item ${selectedId === note.id ? 'selected' : ''}`}
          onClick={() => onSelect(note.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSelect(note.id);
          }}
        >
          <div className="note-list-item-content">
            <h3 className="note-title">{note.title || 'Untitled'}</h3>
            <p className="note-preview">
              {(note.content || '').slice(0, 120) || 'No content'}
            </p>
            <div className="note-meta">
              <span>
                {note.updated_at
                  ? new Date(note.updated_at).toLocaleString()
                  : (note.created_at ? new Date(note.created_at).toLocaleString() : '')}
              </span>
            </div>
          </div>
          <div className="note-actions">
            <button
              className="btn btn-icon"
              title="Delete note"
              aria-label={`Delete note ${note.title || ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              🗑
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
