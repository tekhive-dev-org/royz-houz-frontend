import { useEffect } from "react";
import { useRouter } from "next/router";
import { subscribeToPublicContentChanges } from "@/lib/realtime/publicContentRealtime";

export function usePublicContentRealtime() {
  const router = useRouter();

  useEffect(() => {
    let refreshTimer;
    const unsubscribe = subscribeToPublicContentChanges((payload) => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("royz:public-realtime", { detail: payload }));
        if (router.isReady) {
          void router.replace(router.asPath, undefined, { shallow: false, scroll: false });
        }
      }, 150);
    });

    return () => {
      clearTimeout(refreshTimer);
      unsubscribe();
    };
  }, [router]);
}
