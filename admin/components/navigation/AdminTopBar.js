import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { useAdminNavigation } from "@/hooks/useAdminNavigation";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import styles from "./AdminTopBar.module.css";

export function AdminTopBar({ onOpenNavigation }) {
  const { admin, signOut } = useAdminAuth();
  const navigation = useAdminNavigation();
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [accountAnchor, setAccountAnchor] = useState(null);

  const activeItem =
    navigation.find((item) => item.active) ||
    navigation.find((item) => item.href === "/") ||
    { label: "Dashboard" };

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
        {/* Left Side: Mobile Menu + Mobile Brand Lockup + Desktop Breadcrumbs */}
        <Box className={styles.leftSection}>
          <Tooltip title="Open navigation">
            <IconButton
              className={styles.menuButton}
              onClick={onOpenNavigation}
              aria-label="Open navigation drawer"
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Mobile-Only Branded Identity Lockup */}
          <Link href="/" className={styles.mobileBrandLockup} aria-label="Royz Houz Admin Studio">
            <div className={styles.mobileLogoBox}>
              <Image
                src="/logo.png"
                alt="Royz Houz"
                width={20}
                height={20}
                className={styles.mobileLogoImg}
                priority
              />
            </div>
            <div className={styles.mobileBrandMeta}>
              <span className={styles.mobileBrandEyebrow}>ROYZ HOUZ</span>
              <span className={styles.mobileSectionTitle}>{activeItem.label}</span>
            </div>
          </Link>

          {/* Desktop Breadcrumbs */}
          <Box className={styles.desktopBreadcrumbs}>
            <AdminBreadcrumbs />
          </Box>
        </Box>

        {/* Right Side: Operational Status + Actions + User Account */}
        <Box className={styles.actions}>
          {/* Operational Status: Desktop Full Pill & Mobile Micro Pulse Badge */}
          <div className={styles.statusPill}>
            <span className={styles.statusDotPing} />
            <span className={styles.statusLabel}>Live Operational</span>
          </div>

          <Tooltip title="System Status: Operational">
            <div className={styles.mobileStatusBadge} aria-label="System Operational">
              <span className={styles.statusDotPing} />
              <span className={styles.mobileStatusText}>Live</span>
            </div>
          </Tooltip>

          {/* Quick Link to Public Site (Desktop Button + Mobile Icon Button) */}
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

          <Tooltip title="Open Public Site (New Tab)">
            <IconButton
              component="a"
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Public Site"
              className={styles.mobilePublicBtn}
            >
              <OpenInNewOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

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
            aria-label="Account settings"
          >
            <div className={styles.avatarWrapper}>
              <Avatar className={styles.avatar}>{initials}</Avatar>
            </div>
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
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#FFFFFF" }}>
              Administrative Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              System alerts &amp; audit stream
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
            <div className={styles.menuProfileHeader}>
              <div className={styles.avatarWrapper}>
                <Avatar className={styles.avatar}>{initials}</Avatar>
              </div>
              <div className={styles.menuProfileInfo}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#FFFFFF", lineHeight: 1.2 }}>
                  {admin?.displayName || "Administrator"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                  {admin?.email || "admin@royzhouz.com"}
                </Typography>
              </div>
            </div>
            <span className={styles.accountRoleBadgeMenu}>{admin?.role || "Super Admin"}</span>
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
          <MenuItem onClick={handleSignOut} sx={{ color: "#EF4444 !important", fontWeight: 600 }}>
            <LogoutOutlinedIcon fontSize="small" className={styles.menuItemIconDanger} />
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

