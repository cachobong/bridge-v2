// Creates demo users (one per role) and sample workers. Safe to run more than once.
// Usage: pnpm db:seed
import type { Role } from "@bridge/shared";
import { env } from "../src/lib/env.js";
import { db } from "../src/lib/supabase.js";

// Demo users have a known password. Never create them on a hosted project.
if (!/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(env.SUPABASE_URL)) {
  console.error(`Refusing to seed demo data into ${env.SUPABASE_URL}. Use pnpm db:seed:admin for a hosted project.`);
  process.exit(1);
}

const PASSWORD = "Password123!";

const users: { username: string; fullName: string; role: Role }[] = [
  { username: "admin", fullName: "Ada Admin", role: "admin" },
  { username: "hr", fullName: "Hana Reyes", role: "hr" },
  { username: "payroll", fullName: "Paolo Santos", role: "payroll" },
  { username: "viewer", fullName: "Vera Cruz", role: "viewer" },
  // Linked to the worker Maria Lopez in linkWorkerAccounts().
  { username: "maria", fullName: "Maria Lopez", role: "employee" },
];

async function seedUsers() {
  for (const u of users) {
    const { data: existing } = await db.from("profiles").select("id").eq("username", u.username).maybeSingle();
    if (existing) {
      console.log(`user ${u.username}: exists`);
      continue;
    }
    const { data, error } = await db.auth.admin.createUser({
      email: u.username === "maria" ? "maria.lopez@example.com" : `${u.username}@bridge.local`,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    const id = data.user.id;
    const profile = await db.from("profiles").insert({ id, username: u.username, full_name: u.fullName });
    if (profile.error) throw profile.error;
    const role = await db.from("user_roles").insert({ user_id: id, role_key: u.role });
    if (role.error) throw role.error;
    console.log(`user ${u.username}: created (role ${u.role})`);
  }
}

async function seedWorkers() {
  const { count } = await db.from("workers").select("*", { count: "exact", head: true });
  if (count) {
    console.log(`workers: ${count} exist, skipped`);
    return;
  }
  const { error } = await db.from("workers").insert([
    { worker_type: "employee", first_name: "Maria", last_name: "Lopez", email: "maria.lopez@example.com", job_title: "Software Engineer", department: "Engineering", start_date: "2024-03-01", monthly_salary: 95000 },
    { worker_type: "employee", first_name: "Jose", last_name: "Garcia", email: "jose.garcia@example.com", job_title: "HR Generalist", department: "People", start_date: "2023-07-15", monthly_salary: 60000 },
    { worker_type: "employee", first_name: "Ana", last_name: "Mendoza", email: "ana.mendoza@example.com", job_title: "Accountant", department: "Finance", start_date: "2025-01-06", monthly_salary: 70000, status: "inactive" },
    { worker_type: "contractor", first_name: "Liam", last_name: "Tan", email: "liam.tan@example.com", job_title: "UI Designer", department: "Design", start_date: "2026-02-01", company_name: "Pixel Studio", hourly_rate: 850, contract_end_date: "2026-12-31" },
    { worker_type: "contractor", first_name: "Noah", last_name: "Rivera", email: "noah.rivera@example.com", job_title: "DevOps Consultant", start_date: "2026-05-01", hourly_rate: 1200 },
    // Rows have different keys. Missing keys use the column default, not null.
  ], { defaultToNull: false });
  if (error) throw error;
  console.log("workers: created 5");
}

async function linkWorkerAccounts() {
  const { data: profile } = await db.from("profiles").select("id").eq("username", "maria").single();
  const { error } = await db
    .from("workers")
    .update({ user_id: profile?.id })
    .eq("email", "maria.lopez@example.com")
    .is("user_id", null);
  if (error) throw error;
  console.log("worker Maria Lopez: linked to user maria");
}

await seedUsers();
await seedWorkers();
await linkWorkerAccounts();
console.log(`Done. Demo password for all users: ${PASSWORD}`);
