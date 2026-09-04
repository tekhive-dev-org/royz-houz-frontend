import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { AdminSidebar } from "@/components/navigation/AdminSidebar";
import { AdminTopBar } from "@/components/navigation/AdminTopBar";
import { AdminRouteGuard } from "@/components/auth/AdminRouteGuard";
import { AdminErrorBoundary } from "@/components/feedback/AdminErrorBoundary";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import styles from "./AdminShell.module.css";

/**
 * Responsive authenticated admin shell: permanent desktop sidebar, temporary
 * mobile drawer, top bar, breadcrumbs, account/notification areas, and a
 * guarded main content region with error and toast feedback boundaries.
 */
export function AdminShell({ children }) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <ToastProvider>
      <Box className={styles.root}>
        <AdminTopBar onOpenNavigation={() => setMobileNavigationOpen(true)} />
        <AdminSidebar />
        <AdminSidebar
          mobile
          open={mobileNavigationOpen}
          onClose={() => setMobileNavigationOpen(false)}
        />

        <Box component="main" className={styles.main}>
          <Toolbar />
          <Box className={styles.content}>
            <AdminRouteGuard>
              <AdminErrorBoundary>{children}</AdminErrorBoundary>
            </AdminRouteGuard>
          </Box>
        </Box>
      </Box>
    </ToastProvider>
  );
}
