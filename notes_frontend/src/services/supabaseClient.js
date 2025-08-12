import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration using environment variables.
 * The environment variables must be provided in the build environment:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Create the client only if both env vars exist; otherwise this module will export null
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!supabaseUrl || !supabaseKey) {
  // Provide a helpful warning in development environments.
  // The app will fall back to localStorage-based data handling.
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your environment to enable cloud persistence.'
  );
}
