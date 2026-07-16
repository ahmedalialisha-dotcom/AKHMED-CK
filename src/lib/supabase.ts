import { createClient } from '@supabase/supabase-js';

// Ключи берутся из .env.local (локально) и из Vercel → Settings → Environment Variables (на проде).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Понятная ошибка вместо «белого экрана», если ключи забыли вставить.
if (!url || !anonKey) {
  throw new Error(
    'Нет ключей Supabase. Добавь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файл .env.local.',
  );
}

export const supabase = createClient(url, anonKey);
