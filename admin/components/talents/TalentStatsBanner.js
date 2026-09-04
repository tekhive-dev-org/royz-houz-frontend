import { Box, Typography } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import styles from "./TalentStatsBanner.module.css";

export function TalentStatsBanner({ items = [], categories = [], featuredTalents = [] }) {
  const totalCount = items.length;
  const publishedCount = items.filter((item) => item.status === "published").length;
  const featuredCount =
    featuredTalents.length > 0
      ? featuredTalents.length
      : items.filter((item) => Boolean(item.featured)).length;
  const categoriesCount = categories.length;

  const stats = [
    {
      id: "total",
      label: "Total Roster",
      value: totalCount,
      subtext: `${totalCount === 1 ? "1 artist" : `${totalCount} artists`} registered`,
      icon: <GroupsOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "published",
      label: "Live on Site",
      value: publishedCount,
      subtext: `${publishedCount} active in public directory`,
      icon: <CheckCircleOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
    {
      id: "featured",
      label: "Featured Spotlight",
      value: featuredCount,
      subtext: `${featuredCount} spotlighted on homepage`,
      icon: <AutoAwesomeOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardGold,
      iconVariant: styles.iconGold,
    },
    {
      id: "categories",
      label: "Creative Categories",
      value: categoriesCount,
      subtext: `${categoriesCount} artistic disciplines`,
      icon: <CategoryOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardIndigo,
      iconVariant: styles.iconIndigo,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="Talent Hub Overview Statistics">
      {stats.map((stat) => (
        <Box key={stat.id} className={`${styles.statCard} ${stat.cardVariant}`}>
          <Box className={`${styles.iconWrapper} ${stat.iconVariant}`}>
            {stat.icon}
          </Box>
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

export default TalentStatsBanner;
