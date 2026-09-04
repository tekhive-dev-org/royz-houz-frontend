import { useEffect } from "react";
import { useAdminAuth } from "@/components/auth/AdminAuthProvider";
import { subscribeToAdminChanges } from "@/lib/realtime/adminRealtime";

export function useAdminRealtime() {
  const { status } = useAdminAuth();

  useEffect(() => {
    if (status !== "authorized") return undefined;

    let refreshTimer;
    const unsubscribe = subscribeToAdminChanges((payload) => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("royz:admin-realtime", { detail: payload }));
      }, 150);
    });

    return () => {
      clearTimeout(refreshTimer);
      unsubscribe();
    };
  }, [status]);
}
