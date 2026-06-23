import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

// Fallback logic to support either naming convention (local .env vs vercel)
const supabaseUrl = env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
