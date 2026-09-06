import { useState } from "react";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
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
        {/* Left Side: Mobile Menu + Breadcrumbs */}
        <Box className={styles.breadcrumbArea}>
          <Tooltip title="Open navigation">
            <IconButton
              className={styles.menuButton}
              onClick={onOpenNavigation}
              aria-label="Open navigation drawer"
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <AdminBreadcrumbs />
        </Box>

        {/* Right Side: Operational Status + Actions + User Account */}
        <Box className={styles.actions}>
          {/* Operational Status Indicator */}
          <div className={styles.statusPill}>
            <span className={styles.statusDotPing} />
            <span className={styles.statusLabel}>Live Operational</span>
          </div>

          {/* Quick Link to Public Site */}
          <Button
            component="a"
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            size="small"
            endIcon={<OpenInNewOutlinedIcon fontSize="inherit" />}
            className={styles.publicSiteBtn}
          >
            Public Site
          </Button>

          {/* Notifications Trigger */}
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

          {/* User Account Profile Pill */}
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
              <span className={styles.accountRoleBadge}>{admin?.role || "Admin"}</span>
            </Box>
            <KeyboardArrowDownOutlinedIcon fontSize="small" className={styles.chevronIcon} />
          </Button>
        </Box>

        {/* Notifications Menu */}
        <Menu
          id="admin-notification-menu"
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={closeNotificationMenu}
          MenuListProps={{ "aria-labelledby": "admin-notification-menu" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{ className: styles.dropdownPaper }}
        >
          <Box className={styles.menuHeader}>
            <Typography variant="subtitle2" fontWeight={700}>
              Administrative Notifications
            </Typography>
          </Box>
          <Divider />
          <MenuItem disabled className={styles.emptyMenuItem}>
            No new activity alerts
          </MenuItem>
        </Menu>

        {/* Account Menu */}
        <Menu
          id="admin-account-menu"
          anchorEl={accountAnchor}
          open={Boolean(accountAnchor)}
          onClose={closeAccountMenu}
          MenuListProps={{ "aria-labelledby": "admin-account-menu" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{ className: styles.dropdownPaper }}
        >
          <Box className={styles.accountMenuProfile}>
            <Typography variant="subtitle2" fontWeight={700}>
              {admin?.displayName || "Administrator"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {admin?.email || "admin@royzhouz.com"}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={closeAccountMenu} component={Link} href="/users-and-roles">
            <ShieldOutlinedIcon fontSize="small" className={styles.menuItemIcon} />
            Roles &amp; Permissions
          </MenuItem>
          <MenuItem onClick={closeAccountMenu} component={Link} href="/settings">
            <SettingsOutlinedIcon fontSize="small" className={styles.menuItemIcon} />
            Platform Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut} sx={{ color: "#DC2626 !important" }}>
            <LogoutOutlinedIcon fontSize="small" className={styles.menuItemIcon} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
