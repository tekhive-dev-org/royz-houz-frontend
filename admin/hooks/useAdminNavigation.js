import { useMemo } from "react";
import { useRouter } from "next/router";
import { ADMIN_NAVIGATION } from "@/constants/admin";

function isActivePath(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Supplies the shell with stable navigation configuration and active states. */
export function useAdminNavigation() {
  const router = useRouter();

  return useMemo(
    () => ADMIN_NAVIGATION.map((item) => ({ ...item, active: isActivePath(router.pathname, item.href) })),
    [router.pathname]
  );
}
