import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { validatePublicEnv } from "@/lib/env/client";

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new Error("The admin server Supabase client may only be created on the server.");
  }
}

function appendSetCookie(res, cookie) {
  const current = res.getHeader("Set-Cookie");
  const values = current ? (Array.isArray(current) ? current : [current]) : [];
  res.setHeader("Set-Cookie", [...values, cookie]);
}

function serializeCookie(name, value, options = {}) {
  // Supabase's browser SSR client must rotate this session cookie, so it cannot
  // be HttpOnly. Server handlers still validate it with auth.getUser() rather
  // than trusting cookie content; SameSite and Secure protect its transport.
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path || "/"}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  parts.push(`SameSite=${options.sameSite || "Lax"}`);
  if (options.secure || process.env.NODE_ENV === "production") parts.push("Secure");
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  return parts.join("; ");
}

/**
 * Cookie-backed anonymous-key client for Pages Router SSR and API session
 * validation. It can refresh a session cookie but has no privileged access.
 */
export function createAdminServerClient(req, res) {
  assertServerRuntime();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = validatePublicEnv();

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name) {
        return req.cookies?.[name];
      },
      set(name, value, options) {
        appendSetCookie(res, serializeCookie(name, value, options));
      },
      remove(name, options) {
        appendSetCookie(res, serializeCookie(name, "", { ...options, maxAge: 0 }));
      },
    },
  });
}

/** Validates a caller-provided bearer token without granting elevated access. */
export function createAdminTokenClient() {
  assertServerRuntime();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = validatePublicEnv();
  return createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
