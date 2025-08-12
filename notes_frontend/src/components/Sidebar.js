import React from 'react';

/**
 * Sidebar for navigation and search.
 * @param {{ onCreate: () => void, search: string, onSearchChange: (value:string)=>void }} props
 */
// PUBLIC_INTERFACE
export default function Sidebar({ onCreate, search, onSearchChange }) {
  return (
    <aside className="sidebar" aria-label="Sidebar">
      <button className="btn btn-primary btn-block" onClick={onCreate}>
        + New Note
      </button>
      <div className="search">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes..."
          aria-label="Search notes"
        />
      </div>
      <nav className="nav">
        <div className="nav-section-label">Navigation</div>
        <ul>
          <li className="active" aria-current="page">All Notes</li>
        </ul>
      </nav>
    </aside>
  );
}
