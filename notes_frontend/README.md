# Notes Frontend (React)

Minimalistic, light-themed notes application with a sidebar, searchable list, and editor.  
Supports Supabase-backed persistence via environment variables; falls back to localStorage when not configured.

## Features

- Create, edit, delete notes
- View list of notes with timestamps
- Search notes (title and content)
- Light/dark theme toggle
- Supabase integration via environment variables

## Getting Started

1. Install dependencies:
   npm install

2. (Optional) Configure Supabase:
   - Copy .env.example to .env
   - Set:
     REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
     REACT_APP_SUPABASE_KEY=YOUR-ANON-KEY

   If the variables are not provided, the app uses localStorage.

3. Start the app:
   npm start
   Open http://localhost:3000 in your browser.

4. Run tests:
   npm test

5. Build:
   npm run build

## Supabase Schema

Create a notes table:

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

For more details and optional triggers/policies, see ../../assets/supabase.md.

## Code Structure

- src/components
  - Header.js — App header with theme toggle
  - Sidebar.js — New note button and search field
  - NoteList.js — List of notes with selection and delete
  - NoteEditor.js — Editor (title and content) with Save
- src/services
  - supabaseClient.js — Initializes Supabase client from env vars
  - notesService.js — CRUD abstraction (Supabase or localStorage fallback)
- src/App.js — Main layout and state wiring
- src/App.css — Styles and layout

## Environment Variables

- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

These must be set at build time for Create React App to expose them to the frontend.

## Notes

- With Supabase configured, data is stored in your project database.
- Without it, data is stored in localStorage under key kavia_notes_fallback_v1.
