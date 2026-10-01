import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";
import { env } from "./env.js";

const options = { auth: { persistSession: false, autoRefreshToken: false } };

// Service-role client. Bypasses RLS: use only inside repositories.
export const db = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, options);

// Anon client for password sign-in. A new client per call keeps sessions isolated.
export function createAnonClient() {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options);
}
