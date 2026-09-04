import { Box, Typography } from "@mui/material";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import styles from "./AccessControlStatsBanner.module.css";

export function AccessControlStatsBanner({ profiles = [], roles = [], invitations = [] }) {
  const totalProfiles = profiles.length;
  const activeAdmins = profiles.filter((p) => p.status === "active").length;
  const totalRoles = roles.length;
  const pendingInvites = invitations.length;

  const stats = [
    {
      id: "profiles",
      label: "System Administrators",
      value: totalProfiles,
      subtext: `${totalProfiles === 1 ? "1 team member" : `${totalProfiles} team members`} enrolled`,
      icon: <ManageAccountsOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "active",
      label: "Active Accounts",
      value: activeAdmins,
      subtext: `${activeAdmins} active session credentials`,
      icon: <AdminPanelSettingsOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
    {
      id: "roles",
      label: "Security Roles",
      value: totalRoles,
      subtext: `${totalRoles} RBAC permission tiers defined`,
      icon: <SecurityOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardIndigo,
      iconVariant: styles.iconIndigo,
    },
    {
      id: "invites",
      label: "Pending Invitations",
      value: pendingInvites,
      subtext: pendingInvites > 0 ? "Awaiting recipient onboarding" : "No pending invites",
      icon: <MailOutlineIcon fontSize="medium" />,
      cardVariant: styles.statCardAmber,
      iconVariant: styles.iconAmber,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="Access Control Statistics">
      {stats.map((stat) => (
        <Box key={stat.id} className={`${styles.statCard} ${stat.cardVariant}`}>
          <Box className={`${styles.iconWrapper} ${stat.iconVariant}`}>{stat.icon}</Box>
          <Box className={styles.statInfo}>
            <span className={styles.statLabel}>{stat.label}</span>
            <Typography variant="h5" className={styles.statValue}>
              {stat.value}
            </Typography>
            <span className={styles.statSubtext}>{stat.subtext}</span>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default AccessControlStatsBanner;
