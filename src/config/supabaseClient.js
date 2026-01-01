import { createClient } from '@supabase/supabase-js';

// 1. Зчитуємо змінні з файлу .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing in .env file');
}

// 2. Створюємо єдиний екземпляр клієнта для всього додатку
export const supabase = createClient(supabaseUrl, supabaseAnonKey);