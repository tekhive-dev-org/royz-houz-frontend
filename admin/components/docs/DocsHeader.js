import Link from "next/link";
import { Box, Typography, Button, Chip } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PrintIcon from "@mui/icons-material/Print";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { DOCS_PILLARS, DOCS_CHAPTERS } from "@/constants/docsData";
import { getPublicSiteUrl } from "@/lib/publicSite";
import styles from "./Docs.module.css";

export function DocsHeader({ chapter, onOpenMobileNav }) {
  const pillar = DOCS_PILLARS.find((p) => p.id === chapter.pillarId);
  const chapterIndex = DOCS_CHAPTERS.findIndex((c) => c.slug === chapter.slug);
  const webUrl = chapter.clientWebPath ? getPublicSiteUrl(chapter.clientWebPath) : null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <header className={styles.headerTop}>
      {/* Mobile Drawer Trigger Bar */}
      <div className={styles.mobileNavTriggerRow}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<MenuBookIcon fontSize="small" />}
          onClick={onOpenMobileNav}
          className={styles.mobileNavTriggerBtn}
        >
          Browse Topics ({chapterIndex + 1} / {DOCS_CHAPTERS.length})
        </Button>
      </div>

      <Box sx={{ flexGrow: 1, minWidth: 260 }}>
        <div className={styles.badgeRow}>
          <span className={styles.pillarBadge}>{pillar ? pillar.title : "Documentation"}</span>
          <Chip
            size="small"
            label={chapter.badge}
            sx={{ fontWeight: 600, fontSize: "0.72rem", background: "#F1F5F9", color: "#475569" }}
          />
        </div>

        <Typography variant="h1" className={styles.title}>
          {chapter.title}
        </Typography>

        <Typography variant="body1" className={styles.summaryText}>
          {chapter.summary}
        </Typography>

        <div className={styles.metaRow}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: "0.95rem", color: "#94A3B8" }} />
            <span>{chapter.readTime}</span>
          </Box>
          <span className={styles.metaDivider}>•</span>
          <span className={styles.metaAudience}>
            Audience: <strong>{chapter.targetAudience.join(", ")}</strong>
          </span>
        </div>
      </Box>

      <Box className={styles.actionButtons}>
        {chapter.directAdminUrl && (
          <Button
            component={Link}
            href={chapter.directAdminUrl}
            variant="contained"
            size="medium"
            endIcon={<LaunchIcon fontSize="small" />}
            className={styles.adminBtn}
          >
            Open Admin Tool
          </Button>
        )}

        {webUrl && (
          <Button
            component="a"
            href={webUrl}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            size="medium"
            endIcon={<OpenInNewIcon fontSize="small" />}
            className={styles.webBtn}
          >
            View Live Web
          </Button>
        )}

        <Button
          variant="outlined"
          size="medium"
          onClick={handlePrint}
          className={styles.printBtn}
          title="Print or Save as PDF"
        >
          <PrintIcon fontSize="small" />
        </Button>
      </Box>
    </header>
  );
}
