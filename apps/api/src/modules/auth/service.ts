import type { CurrentUser, LoginInput, Session } from "@bridge/shared";
import { fromDbError, unauthorized } from "../../lib/errors.js";
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
