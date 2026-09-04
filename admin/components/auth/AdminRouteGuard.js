import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { useAdminAuth } from "./AdminAuthProvider";

/** Client-side session-expiry UX guard. SSR guards remain the security boundary. */
export function AdminRouteGuard({ children }) {
  const router = useRouter();
  const redirectInProgressRef = useRef(false);
  const { isLoading, status } = useAdminAuth();

  useEffect(() => {
    if (!router.isReady || isLoading || status === "authorized") {
      redirectInProgressRef.current = false;
      return;
    }
    if (redirectInProgressRef.current) return;

    redirectInProgressRef.current = true;
    if (status === "unauthorized") {
      void router.replace("/unauthorized");
      return;
    }

    const next = getSafeRedirectPath(router.asPath);
    void router.replace(`/login?reason=session-expired&next=${encodeURIComponent(next)}`);
  }, [isLoading, router, router.asPath, router.isReady, status]);

  if (status === "authorized") return children;

  return <AdminLoadingState label="Restoring your secure session…" />;
}
