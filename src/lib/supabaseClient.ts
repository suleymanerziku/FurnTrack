
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL" || !supabaseUrl.startsWith("http")) {
  const errorMsg = 'Supabase URL is missing, is a placeholder, or is invalid. Ensure NEXT_PUBLIC_SUPABASE_URL is correctly set in your .env file and starts with http(s)://.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}
if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
  const errorMsg = 'Supabase Anon Key is missing or is a placeholder. Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is correctly set in your .env file.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
