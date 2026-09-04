import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { getAdminBrowserClient } from "@/lib/supabase/browser";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

const AdminAuthContext = createContext(null);

async function loadServerAuthorizedAdmin(session) {
  if (!session?.access_token) return { admin: null, status: "unauthenticated" };

  const response = await fetch("/api/admin/auth/session", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    return { admin: null, status: response.status === 401 ? "unauthenticated" : "unauthorized" };
  }

  return { admin: payload.data.admin, status: "authorized" };
}

export function AdminAuthProvider({ children }) {
  const router = useRouter();
  const explicitLogoutRef = useRef(false);
  const sessionRestoreVersionRef = useRef(0);
  const [state, setState] = useState({ isLoading: true, session: null, admin: null, status: "unauthenticated" });

  const restoreSession = useCallback(async (session) => {
    const restoreVersion = ++sessionRestoreVersionRef.current;

    if (!session?.access_token) {
      setState({ isLoading: false, session: null, admin: null, status: "unauthenticated" });
      return;
    }

    try {
      const access = await loadServerAuthorizedAdmin(session);
      if (restoreVersion !== sessionRestoreVersionRef.current) return;
      setState({ isLoading: false, session, ...access });
    } catch {
      if (restoreVersion !== sessionRestoreVersionRef.current) return;
      setState({ isLoading: false, session, admin: null, status: "unauthorized" });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subscription;

    try {
      const supabase = getAdminBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        if (isMounted) void restoreSession(data.session);
      });
      ({ data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // getSession above owns initial restoration. Handling INITIAL_SESSION as
        // well starts a second, competing authorization request.
        if (event !== "INITIAL_SESSION" && isMounted) void restoreSession(session);
      }));
    } catch {
      if (isMounted) setState({ isLoading: false, session: null, admin: null, status: "unauthorized" });
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [restoreSession]);

  const signIn = useCallback(async ({ email, password, next }) => {
    const supabase = getAdminBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return { success: false, message: "Unable to sign in with those credentials." };

    const signInVersion = ++sessionRestoreVersionRef.current;
    const access = await loadServerAuthorizedAdmin(data.session);
    if (signInVersion !== sessionRestoreVersionRef.current) {
      return { success: false, message: "Your session changed while signing in. Please try again." };
    }
    if (access.status !== "authorized") {
      await supabase.auth.signOut();
      setState({ isLoading: false, session: null, admin: null, status: "unauthorized" });
      return { success: false, unauthorized: true, message: "This account does not have active administrative access." };
    }

    setState({ isLoading: false, session: data.session, ...access });
    await router.replace(getSafeRedirectPath(next));
    return { success: true };
  }, [router]);

  const signOut = useCallback(async () => {
    explicitLogoutRef.current = true;
    try {
      await getAdminBrowserClient().auth.signOut();
    } finally {
      setState({ isLoading: false, session: null, admin: null, status: "unauthenticated" });
      await router.replace("/login");
      explicitLogoutRef.current = false;
    }
  }, [router]);

  const value = useMemo(() => ({ ...state, signIn, signOut }), [signIn, signOut, state]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider.");
  return context;
}
