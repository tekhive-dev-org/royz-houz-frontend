import Link from "next/link";
import Image from "next/image";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { ADMIN_NAVIGATION_GROUPS } from "@/constants/admin";
import { useAdminNavigation } from "@/hooks/useAdminNavigation";
import styles from "./AdminSidebar.module.css";

const ICONS = {
  applications: CampaignOutlinedIcon,
  article: ArticleOutlinedIcon,
  audit: ReceiptLongOutlinedIcon,
  comment: CommentOutlinedIcon,
  contacts: NotificationsActiveOutlinedIcon,
  dashboard: DashboardOutlinedIcon,
  donations: VolunteerActivismOutlinedIcon,
  event: EventOutlinedIcon,
  home: HomeOutlinedIcon,
  info: InfoOutlinedIcon,
  language: LanguageOutlinedIcon,
  media: PermMediaOutlinedIcon,
  newsletter: MailOutlineOutlinedIcon,
  payments: ReceiptLongOutlinedIcon,
  people: GroupOutlinedIcon,
  reports: ReportProblemOutlinedIcon,
  bookings: EventAvailableOutlinedIcon,
  search: ManageSearchOutlinedIcon,
  security: SecurityOutlinedIcon,
  settings: SettingsOutlinedIcon,
  store: StorefrontOutlinedIcon,
};

function SidebarContent({ onNavigate }) {
  const navigation = useAdminNavigation();

  return (
    <Box className={styles.content}>
      {/* Brand Header with Real Logo */}
      <Box className={styles.brand}>
        <Link href="/" className={styles.brandLink} onClick={onNavigate}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo.png"
              alt="Royz House Logo"
              width={38}
              height={38}
              className={styles.logoImage}
              priority
            />
          </div>
          <Box className={styles.brandTextGroup}>
            <span className={styles.brandEyebrow}>ROYZ HOUZ</span>
            <span className={styles.brandTitle}>Admin Studio</span>
          </Box>
        </Link>
      </Box>

      <Divider className={styles.divider} />

      {/* Navigation Groups */}
      <Box component="nav" aria-label="Admin navigation" className={styles.navigation}>
        {ADMIN_NAVIGATION_GROUPS.map((group) => {
          const items = navigation.filter((item) => item.group === group);
          if (!items.length) return null;

          return (
            <Box key={group} className={styles.group}>
              <Typography component="p" variant="overline" className={styles.groupLabel}>
                {group}
              </Typography>
              <List disablePadding>
                {items.map((item) => {
                  const Icon = ICONS[item.icon] || DashboardOutlinedIcon;
                  return (
                    <ListItemButton
                      key={item.id}
                      component={Link}
                      href={item.href}
                      selected={item.active}
                      className={styles.navigationItem}
                      onClick={onNavigate}
                    >
                      <ListItemIcon className={styles.navigationIcon}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: item.active ? 600 : 400,
                          fontSize: "0.84rem",
                        }}
                      />
                      {item.active && <span className={styles.activePillIndicator} />}
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* Sidebar Footer */}
      <Box className={styles.sidebarFooter}>
        <div className={styles.statusRow}>
          <FiberManualRecordIcon className={styles.liveDot} />
          <span className={styles.statusText}>Enterprise Production</span>
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className={styles.viewSiteBtn}
        >
          <span>View Public Site</span>
          <OpenInNewIcon fontSize="inherit" className={styles.openIcon} />
        </a>
      </Box>
    </Box>
  );
}

export function AdminSidebar({ mobile = false, open = false, onClose }) {
  return (
    <Drawer
      variant={mobile ? "temporary" : "permanent"}
      open={mobile ? open : true}
      onClose={onClose}
      ModalProps={mobile ? { keepMounted: true } : undefined}
      className={mobile ? styles.mobileDrawer : styles.desktopDrawer}
      PaperProps={{ className: styles.paper }}
    >
      <SidebarContent onNavigate={mobile ? onClose : undefined} />
    </Drawer>
  );
}
