# Supabase Integration for Notes Frontend

This app uses Supabase for cloud persistence. If environment variables are not configured, the app falls back to localStorage so it can still run for development/demo.

## What this automation configured

In your Supabase project, the following steps were performed to ensure compatibility with this frontend:

1. Ensured UUID generation extension is available:
   - create extension if not exists "uuid-ossp";

2. Verified the `public.notes` table exists. It already existed, so no destructive changes were made.

3. Aligned defaults with frontend expectations:
   - ALTER TABLE public.notes ALTER COLUMN title SET DEFAULT 'Untitled';
   - ALTER TABLE public.notes ALTER COLUMN content SET DEFAULT '';

4. Installed and wired an `updated_at` trigger that automatically updates timestamps on updates:
   - Function: `public.set_updated_at()`
   - Trigger: `set_notes_updated_at` on `public.notes` BEFORE UPDATE

5. Row Level Security (RLS) was enabled previously on `public.notes`. For a simple public demo (not recommended for production), RLS was disabled on this table so that the anon key can read/write:
   - ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;

You can re-enable RLS and configure policies following the examples below.

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

The frontend expects at least the following columns. Your `notes` table already exists; the script ensured defaults and installed the `updated_at` trigger.

```sql
-- Enable an extension for UUIDs (either of the following may be used depending on your project)
-- create extension if not exists "pgcrypto";
-- or:
create extension if not exists "uuid-ossp";

-- Minimal schema compatible with the app
create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(), -- or: gen_random_uuid()
  title text not null default 'Untitled',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: if you have extra fields (e.g., category), the app will ignore them.
```

### Auto-updating updated_at

```sql
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

## RLS and Policies

For a public demo, RLS is currently disabled on `public.notes`. This allows the anon key (used by the frontend) to read/write without policies.

If you want to run with RLS enabled (recommended for production), you can enable RLS and add permissive anon policies or, better, require authentication and scope rows to users.

Enable RLS:
```sql
alter table public.notes enable row level security;
```

Permissive policies for anon-only demo (NOT FOR PRODUCTION):
```sql
-- Allow anyone using the anon key to read
create policy "notes_anon_select"
on public.notes
for select
to anon
using (true);

-- Allow anyone using the anon key to insert
create policy "notes_anon_insert"
on public.notes
for insert
to anon
with check (true);

-- Allow anyone using the anon key to update
create policy "notes_anon_update"
on public.notes
for update
to anon
using (true)
with check (true);

-- Allow anyone using the anon key to delete
create policy "notes_anon_delete"
on public.notes
for delete
to anon
using (true);
```

Recommended pattern with authenticated users (outline):
- Add an `author_id uuid` column linked to `auth.users`.
- On insert, set `author_id = auth.uid()`.
- Policies that restrict access to rows where `author_id = auth.uid()`.

## Status and Verification SQL

Check RLS state:
```sql
select c.relname as table, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'notes';
```

Check policies (if you enabled them):
```sql
select polname, permissive, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'notes';
```

Verify defaults:
```sql
-- Should show 'Untitled' and '' respectively
select column_name, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'notes'
  and column_name in ('title','content');
```

## Client Usage

The app initializes Supabase in `src/services/supabaseClient.js` using `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY`.

CRUD operations are abstracted by `src/services/notesService.js`:
- `fetchNotes()` — list all notes (sorted by `updated_at desc`)
- `searchNotes(query)` — simple ilike-based search over `title` and `content`
- `createNote({ title, content })`
- `updateNote(id, patch)`
- `deleteNote(id)`

If the environment variables are missing, `NotesService` automatically switches to a localStorage-based persistence layer so you can still run and test the app.

## Redirect URLs (Optional)

If you later add authentication flows, ensure any email redirect URL(s) use your deployed site URL via a `REACT_APP_*` variable so it maps to your final deployment URL. See Supabase Auth settings for URL configuration and templates.

## Troubleshooting

- 401/permission errors from the browser: RLS may be enabled without policies allowing anon access. Either disable RLS (demo) or create policies for anon/authenticated users.
- 400 errors on insert: Ensure defaults are set and required fields are present.
- Build-time missing env vars: CRA only exposes variables prefixed with `REACT_APP_`. Verify `.env` exists under `notes_frontend/` and the variables are set before `npm start`/`npm build`.
