import { Box, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import styles from "./SeoStatsBanner.module.css";

export function SeoStatsBanner({ records = [] }) {
  const totalRecords = records.length;
  const customOverrides = records.filter((r) => Boolean(r.has_custom_seo || r.hasCustomSeo || r.title)).length;
  const indexedCount = records.filter((r) => !r.no_index && !r.noIndex).length;
  const staticCount = records.filter((r) => r.type === "static").length;

  const stats = [
    {
      id: "total",
      label: "Tracked Entities",
      value: totalRecords,
      subtext: `${totalRecords === 1 ? "1 entity" : `${totalRecords} entities`} in search index`,
      icon: <LanguageIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "indexed",
      label: "Indexed by Search",
      value: indexedCount,
      subtext: `${indexedCount} pages crawlable by Google & Bing`,
      icon: <CheckCircleOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
    {
      id: "overrides",
      label: "Custom SEO Overrides",
      value: customOverrides,
      subtext: `${customOverrides} tuned title & Open Graph tags`,
      icon: <TuneOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardBlue,
      iconVariant: styles.iconBlue,
    },
    {
      id: "static",
      label: "Core Web Pages",
      value: staticCount,
      subtext: `${staticCount} primary landing routes`,
      icon: <SearchIcon fontSize="medium" />,
      cardVariant: styles.statCardAmber,
      iconVariant: styles.iconAmber,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="SEO Health Statistics">
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

export default SeoStatsBanner;
