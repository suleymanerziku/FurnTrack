
import { createBrowserClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Supabase URL is missing from environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL is set.');
  // Throw an error to prevent client initialization with missing URL
  throw new Error('Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL.');
}
if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is missing from environment variables. Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set.');
  // Throw an error to prevent client initialization with missing Key
  throw new Error('Supabase Anon Key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

// If we reach here, supabaseUrl and supabaseAnonKey are guaranteed to be defined (as per the checks above).
// However, their types from process.env are string | undefined. The checks ensure they are treated as strings.
export const supabase = createBrowserClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string
);
