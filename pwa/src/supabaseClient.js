import { createClient } from '@supabase/supabase-js';

// // Mengambil URL dan kunci anon dari environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// // Mengecek apakah environment variables sudah diatur
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be provided in .env file');
}

// // Membuat dan mengekspor client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('PWA Supabase client initialized.'); // // Log untuk debugging
