// Admin-only edge function to create employee/client users
// Verifies the caller is a super_admin via their JWT, then uses the
// service role to create the auth user, assign role, and set profile.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

function emailFromUsername(username: string) {
  return `${username.toLowerCase().replace(/[^a-z0-9_.-]/g, "")}@visahobe.local`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return json({ error: "Missing auth" }, 401);
    }

    // Caller client (to verify role)
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Confirm caller is super_admin
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const isAdmin = (roles || []).some((r: any) => r.role === "super_admin");
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const { username, password, role, full_name } = body as {
      username?: string;
      password?: string;
      role?: "employee" | "client";
      full_name?: string;
    };

    if (!username || !password || !role || !["employee", "client"].includes(role)) {
      return json({ error: "username, password, and role (employee|client) are required" }, 400);
    }
    if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

    const email = emailFromUsername(username);

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || username, role, username },
    });
    if (createErr || !created.user) {
      return json({ error: createErr?.message || "Could not create user" }, 400);
    }

    // The handle_new_user trigger should have inserted role+profile; force the role anyway.
    await admin.from("user_roles").delete().eq("user_id", created.user.id);
    await admin.from("user_roles").insert({ user_id: created.user.id, role });
    await admin
      .from("profiles")
      .update({ full_name: full_name || username })
      .eq("id", created.user.id);

    return json({ ok: true, user: { id: created.user.id, username, email, role } });
  } catch (e: any) {
    return json({ error: e?.message || "Server error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
