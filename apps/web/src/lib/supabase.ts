import { createClient } from "@supabase/supabase-js";

// Browser client. It persists the session in localStorage and refreshes the token.
// Login itself goes through the API (POST /api/auth/login), then setSession().
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
