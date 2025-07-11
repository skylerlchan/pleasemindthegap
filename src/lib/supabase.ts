import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://diwtbldahnsdydwbnrec.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key. Please check your .env file and ensure VITE_SUPABASE_ANON_KEY is set.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)