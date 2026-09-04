import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { AppBar, Avatar, Badge, Box, Button, IconButton, Menu, MenuItem, Toolbar, Tooltip, Typography, Divider } from "@mui/material";
import { useAdminAuth } from "@/components/auth/AdminAuthProvider";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import styles from "./AdminTopBar.module.css";

export function AdminTopBar({ onOpenNavigation }) {
  const { admin, signOut } = useAdminAuth();
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [accountAnchor, setAccountAnchor] = useState(null);

  function closeNotificationMenu() {
    setNotificationAnchor(null);
  }

  function closeAccountMenu() {
    setAccountAnchor(null);
  }

  async function handleSignOut() {
    closeAccountMenu();
    await signOut();
  }

  const initials = (admin?.displayName || "Admin")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppBar component="header" elevation={0} position="fixed" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Box className={styles.breadcrumbArea}>
          <Tooltip title="Open navigation">
            <IconButton className={styles.menuButton} onClick={onOpenNavigation} aria-label="Open navigation">
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <AdminBreadcrumbs />
        </Box>

        <Box className={styles.actions}>
          {/* Live Status Badge */}
          <Box className={styles.statusPill}>
            <span className={styles.statusDot} />
            <span className={styles.statusLabel}>Live System</span>
          </Box>

          <Tooltip title="Notifications">
            <IconButton
              aria-label="Open notifications"
              aria-controls={notificationAnchor ? "admin-notification-menu" : undefined}
              aria-expanded={Boolean(notificationAnchor)}
              aria-haspopup="menu"
              onClick={(event) => setNotificationAnchor(event.currentTarget)}
              className={styles.iconBtn}
            >
              <Badge color="primary" variant="dot" invisible>
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account profile">
            <Button
              className={styles.accountButton}
              aria-controls={accountAnchor ? "admin-account-menu" : undefined}
              aria-expanded={Boolean(accountAnchor)}
              aria-haspopup="menu"
              onClick={(event) => setAccountAnchor(event.currentTarget)}
            >
              <Avatar className={styles.avatar}>{initials}</Avatar>
              <Box className={styles.accountMeta}>
                <span className={styles.accountName}>{admin?.displayName || "Administrator"}</span>
                <span className={styles.accountRole}>{admin?.role || "Admin"}</span>
              </Box>
            </Button>
          </Tooltip>
        </Box>

        <Menu
          id="admin-notification-menu"
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={closeNotificationMenu}
          MenuListProps={{ "aria-labelledby": "admin-notification-menu" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box className={styles.menuHeader}>
            <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
          </Box>
          <Divider />
          <MenuItem disabled className={styles.emptyMenuItem}>
            No new activity notifications
          </MenuItem>
        </Menu>

        <Menu
          id="admin-account-menu"
          anchorEl={accountAnchor}
          open={Boolean(accountAnchor)}
          onClose={closeAccountMenu}
          MenuListProps={{ "aria-labelledby": "admin-account-menu" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box className={styles.accountMenuProfile}>
            <Typography variant="subtitle2" fontWeight={700}>{admin?.displayName || "Administrator"}</Typography>
            <Typography variant="caption" color="text.secondary">{admin?.email || "admin@royzhouz.com"}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={closeAccountMenu} component="a" href="/users-and-roles">
            <ShieldOutlinedIcon fontSize="small" className={styles.menuItemIcon} />
            Roles &amp; Permissions
          </MenuItem>
          <MenuItem onClick={handleSignOut} sx={{ color: "#EF4444" }}>
            <LogoutOutlinedIcon fontSize="small" className={styles.menuItemIcon} />
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
