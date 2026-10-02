import { useState, useMemo } from "react";
import Link from "next/link";
import { Box, Typography, TextField, InputAdornment, Drawer, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CloseIcon from "@mui/icons-material/Close";
import { DOCS_PILLARS, DOCS_CHAPTERS } from "@/constants/docsData";
import styles from "./Docs.module.css";

function SidebarNavContent({ activeSlug, onSelectChapter, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return DOCS_CHAPTERS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.badge.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.sidebarHeader}>
        <Typography variant="subtitle2" className={styles.sidebarTitle}>
          <MenuBookIcon fontSize="small" sx={{ color: "#B46A2C" }} />
          Operations White Paper
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close navigation drawer">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </div>

      <div className={styles.sidebarSearchBox}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search topics, fields, SOPs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
              </InputAdornment>
            ),
            sx: { fontSize: "0.85rem", background: "#FFFFFF" },
          }}
        />
      </div>

      <nav className={styles.sidebarNavList}>
        {filteredChapters ? (
          <div>
            <Typography className={styles.pillarHeader}>
              Search Results ({filteredChapters.length})
            </Typography>
            {filteredChapters.map((chapter) => {
              const isActive = chapter.slug === activeSlug;
              return (
                <Link
                  key={chapter.slug}
                  href={`/docs/${chapter.slug}`}
                  onClick={onSelectChapter}
                  className={`${styles.chapterItem} ${isActive ? styles.chapterItemActive : ""}`}
                >
                  <span>{chapter.title}</span>
                  <span className={styles.chapterBadge}>{chapter.badge}</span>
                </Link>
              );
            })}
            {filteredChapters.length === 0 && (
              <Box px={2.5} py={2}>
                <Typography variant="body2" sx={{ color: "#94A3B8", fontStyle: "italic" }}>
                  No matching chapters found.
                </Typography>
              </Box>
            )}
          </div>
        ) : (
          DOCS_PILLARS.map((pillar) => {
            const pillarChapters = DOCS_CHAPTERS.filter((c) => c.pillarId === pillar.id);
            if (!pillarChapters.length) return null;

            return (
              <div key={pillar.id}>
                <Typography className={styles.pillarHeader}>{pillar.title}</Typography>
                {pillarChapters.map((chapter) => {
                  const isActive = chapter.slug === activeSlug;
                  return (
                    <Link
                      key={chapter.slug}
                      href={`/docs/${chapter.slug}`}
                      onClick={onSelectChapter}
                      className={`${styles.chapterItem} ${isActive ? styles.chapterItemActive : ""}`}
                    >
                      <span>{chapter.title}</span>
                      <span className={styles.chapterBadge}>{chapter.badge}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })
        )}
      </nav>
    </div>
  );
}

export function DocsSidebar({ activeSlug, mobile = false, open = false, onClose }) {
  if (mobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: "min(88vw, 340px)", background: "#FFFFFF" },
        }}
      >
        <SidebarNavContent
          activeSlug={activeSlug}
          onSelectChapter={onClose}
          onClose={onClose}
        />
      </Drawer>
    );
  }

  return (
    <aside className={styles.desktopSidebar} aria-label="Documentation Navigation">
      <SidebarNavContent activeSlug={activeSlug} />
    </aside>
  );
}
