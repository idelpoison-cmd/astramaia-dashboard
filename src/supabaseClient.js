import { createClient } from '@supabase/supabase-js';

// Esto le dice a la web que busque las variables seguras que configuraste en Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);