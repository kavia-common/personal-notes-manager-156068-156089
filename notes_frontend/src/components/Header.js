import React from 'react';

/**
 * Header component showing app title and theme toggle button.
 * @param {{ theme: 'light'|'dark', onToggleTheme: () => void }} props
 */
// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="app-logo" aria-hidden="true">📝</span>
        <h1 className="app-title">Notes</h1>
      </div>
      <div className="header-actions">
        <button
          className="btn btn-secondary"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </header>
  );
}
