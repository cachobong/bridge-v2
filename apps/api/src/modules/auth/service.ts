import type { CurrentUser, LoginInput, Session } from "@bridge/shared";
import { conflict, fromDbError, unauthorized } from "../../lib/errors.js";
import { createAnonClient, db } from "../../lib/supabase.js";
import { getUserAccess } from "../rbac/index.js";

const INVALID_LOGIN = "Invalid username or password";

async function loadCurrentUser(userId: string): Promise<CurrentUser> {
  const { data: profile, error } = await db.from("profiles").select("id, username, full_name").eq("id", userId).maybeSingle();
  if (error) throw fromDbError(error);
  if (!profile) throw unauthorized("No profile for this user");
  const access = await getUserAccess(userId);
  return { id: profile.id, username: profile.username, fullName: profile.full_name, ...access };
}

// Supabase Auth signs in by email. Resolve the username to the auth user's email first.
export async function login({ username, password }: LoginInput): Promise<{ session: Session; user: CurrentUser }> {
  const { data: profile, error } = await db.from("profiles").select("id").eq("username", username.toLowerCase()).maybeSingle();
  if (error) throw fromDbError(error);
  if (!profile) throw unauthorized(INVALID_LOGIN);

  const { data: authUser, error: adminError } = await db.auth.admin.getUserById(profile.id);
  if (adminError || !authUser.user.email) throw unauthorized(INVALID_LOGIN);

  const { data, error: signInError } = await createAnonClient().auth.signInWithPassword({
    email: authUser.user.email,
    password,
  });
  if (signInError || !data.session) throw unauthorized(INVALID_LOGIN);

  return {
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at ?? null,
    },
    user: await loadCurrentUser(data.user.id),
  };
}

export async function authenticate(accessToken: string): Promise<CurrentUser> {
  const { data, error } = await db.auth.getUser(accessToken);
  if (error || !data.user) throw unauthorized("Invalid or expired token");
  return loadCurrentUser(data.user.id);
}

// Creates a Supabase auth user and its profile. Returns the new user id.
export async function createUser(input: { username: string; fullName: string; email: string; password: string }): Promise<string> {
  const username = input.username.toLowerCase();
  const { data: existing, error: lookupError } = await db.from("profiles").select("id").eq("username", username).maybeSingle();
  if (lookupError) throw fromDbError(lookupError);
  if (existing) throw conflict(`Username "${username}" is already taken`);

  const { data, error } = await db.auth.admin.createUser({ email: input.email, password: input.password, email_confirm: true });
  if (error) {
    if (error.status === 422) throw conflict(`A login with the email ${input.email} already exists`);
    throw error;
  }

  const profile = await db.from("profiles").insert({ id: data.user.id, username, full_name: input.fullName });
  if (profile.error) {
    // Do not leave an auth user without a profile.
    await db.auth.admin.deleteUser(data.user.id);
    throw fromDbError(profile.error);
  }
  return data.user.id;
}
