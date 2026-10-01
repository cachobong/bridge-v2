// Creates one admin user and nothing else. Use this for a hosted project.
// Reads from the root .env:
//   SEED_ADMIN_PASSWORD  required, at least 12 characters
//   SEED_ADMIN_USERNAME  optional, default "admin"
//   SEED_ADMIN_EMAIL     optional, default "<username>@bridge.local"
// Usage: pnpm db:seed:admin  (then remove SEED_ADMIN_PASSWORD from .env)
import { db } from "../src/lib/supabase.js";

const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
const password = process.env.SEED_ADMIN_PASSWORD ?? "";
const email = process.env.SEED_ADMIN_EMAIL ?? `${username}@bridge.local`;

if (password.length < 12) {
  console.error("Set SEED_ADMIN_PASSWORD in .env (at least 12 characters).");
  process.exit(1);
}

const { data: existing } = await db.from("profiles").select("id").eq("username", username).maybeSingle();
if (existing) {
  console.log(`user ${username}: exists, nothing changed`);
  process.exit(0);
}

const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
if (error) throw error;
const id = data.user.id;

const profile = await db.from("profiles").insert({ id, username, full_name: "Administrator" });
if (profile.error) {
  await db.auth.admin.deleteUser(id);
  throw profile.error;
}
const role = await db.from("user_roles").insert({ user_id: id, role_key: "admin" });
if (role.error) throw role.error;

console.log(`user ${username}: created (role admin, email ${email})`);
