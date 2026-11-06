import { createClient } from '@supabase/supabase-js';

// 1. La misma URL de tu proyecto
const supabaseUrl = 'https://rbxzlgfxqqxuhuacqopv.supabase.co';

// 2. OJO: Aquí va la clave PÚBLICA (sb_publishable_...), NUNCA la secreta
const supabaseAnonKey = 'sb_publishable_aTzMTwxzS58fgkFSYhoLEA_V3EG-Cfe';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);