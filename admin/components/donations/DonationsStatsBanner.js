import { Box, Typography } from "@mui/material";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import styles from "./DonationsStatsBanner.module.css";

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function DonationsStatsBanner({ campaigns = [], records = [], totals = {} }) {
  const totalRaised = totals.grandTotal || records.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "published").length;
  const totalDonors = new Set(records.map((r) => r.donor_email || r.donorEmail).filter(Boolean)).size || records.length;
  const averageGift = records.length > 0 ? totalRaised / records.length : 0;

  const stats = [
    {
      id: "total",
      label: "Total Giving Raised",
      value: formatCurrency(totalRaised),
      subtext: `Across ${records.length} successful donations`,
      icon: <MonetizationOnOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "active",
      label: "Active Campaigns",
      value: activeCampaigns,
      subtext: `${activeCampaigns} public causes accepting gifts`,
      icon: <VolunteerActivismOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
    {
      id: "donors",
      label: "Unique Donors",
      value: totalDonors,
      subtext: `${totalDonors} patron supporters registered`,
      icon: <PeopleOutlineIcon fontSize="medium" />,
      cardVariant: styles.statCardIndigo,
      iconVariant: styles.iconIndigo,
    },
    {
      id: "average",
      label: "Average Gift",
      value: formatCurrency(averageGift),
      subtext: "Mean contribution per patron",
      icon: <TrendingUpOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardGold,
      iconVariant: styles.iconGold,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="Donations & Giving Statistics">
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

export default DonationsStatsBanner;
