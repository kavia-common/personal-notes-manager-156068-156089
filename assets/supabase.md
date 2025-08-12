# Supabase Integration for Notes Frontend

This app uses Supabase for cloud persistence. If environment variables are not configured, the app falls back to localStorage so it can still run for development/demo.

## Environment Variables

Create a `.env` file under `notes_frontend/` based on `.env.example` and set:

- `REACT_APP_SUPABASE_URL` — your Supabase project URL
- `REACT_APP_SUPABASE_KEY` — your Supabase anon public API key

Example:

```
REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
REACT_APP_SUPABASE_KEY=YOUR-ANON-KEY
```

These must be available at build time (Create React App reads `REACT_APP_*` variables).

## Expected Table Schema

Create a `notes` table in your Supabase project. Below is a minimal schema compatible with the frontend:

```sql
-- Enable an extension for UUIDs (either of the following may be used depending on your project)
-- create extension if not exists "pgcrypto";
-- or:
-- create extension if not exists "uuid-ossp";

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(), -- or: uuid_generate_v4()
  title text not null default 'Untitled',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional trigger to auto-update updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at
before update on public.notes
for each row
execute procedure public.set_updated_at();
```

If you plan to enable Row Level Security (RLS), add policies to allow read/write for your desired auth model. For a public demo (not recommended for production), you could temporarily disable RLS or allow anon reads/writes.

## Client Usage

The app initializes Supabase in `src/services/supabaseClient.js` using the above environment variables. The CRUD operations are abstracted by `src/services/notesService.js`.

- `fetchNotes()` — list all notes (sorted by `updated_at desc`)
- `searchNotes(query)` — full-text like search over `title` and `content`
- `createNote({ title, content })`
- `updateNote(id, patch)`
- `deleteNote(id)`

If the environment variables are missing, `NotesService` automatically switches to a localStorage-based persistence layer so you can still run and test the app.

## Redirect URLs (Optional)

If you later add authentication flows, ensure any email redirect URL(s) use your deployed site URL via the appropriate environment variable (in CRA, a `REACT_APP_*` variable) so it maps to your final deployment URL.
