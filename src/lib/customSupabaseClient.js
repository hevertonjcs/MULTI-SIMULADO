import { createClient } from '@supabase/supabase-js';

// Supabase credentials fallback. Use environment variables to override these defaults in production.
const fallbackSupabaseUrl = 'https://ltvjiknujwhcqetlofzz.supabase.co';
const fallbackSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmppa251andoY3FldGxvZnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzI1NzEsImV4cCI6MjA2NDU0ODU3MX0.MIQxh-g6i22FWdxAgwAOo0RMW_DYG5nvexI5eEtUnbQ';

const supabaseUrlFromEnv = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKeyFromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrlToUse = supabaseUrlFromEnv || fallbackSupabaseUrl;
const supabaseAnonKeyToUse = supabaseAnonKeyFromEnv || fallbackSupabaseAnonKey;

export const supabase = createClient(supabaseUrlToUse, supabaseAnonKeyToUse);