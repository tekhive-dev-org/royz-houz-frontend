import { useState } from "react";
import Link from "next/link";
import { Button, Paper, Typography } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import styles from "./SpotlightTalentsWidget.module.css";

function getTalentMeta(talent) {
  let category = "Creative Artist";
  let avatarUrl = null;

  if (talent?.body) {
    let b = talent.body;
    if (typeof b === "string") {
      try {
        b = JSON.parse(b);
      } catch {
        // Plain text
      }
    }
    if (typeof b === "object" && b !== null) {
      if (b.category) category = b.category;
      else if (b.role) category = b.role;
      else if (b.profession) category = b.profession;

      avatarUrl =
        b.image ||
        b.avatar ||
        b.coverImage ||
        b.cover_image ||
        b.photo ||
        (Array.isArray(b.galleryImages) && b.galleryImages.length > 0 ? b.galleryImages[0] : null);
    }
  }

  if (!avatarUrl && talent) {
    avatarUrl = talent.image || talent.avatar || talent.cover_image;
  }

  if (typeof avatarUrl === "string") {
    avatarUrl = avatarUrl.trim();
    if (
      avatarUrl.length > 0 &&
      !avatarUrl.startsWith("http://") &&
      !avatarUrl.startsWith("https://") &&
      !avatarUrl.startsWith("/") &&
      !avatarUrl.startsWith("data:")
    ) {
      avatarUrl = `/${avatarUrl}`;
    }
  } else {
    avatarUrl = null;
  }

  return { category, avatarUrl };
}

function TalentAvatar({ src, name }) {
  const [loadError, setLoadError] = useState(false);
  const initial = (name || "T").trim().charAt(0).toUpperCase() || "T";

  if (!src || loadError) {
    return (
      <div className={styles.avatarPlaceholder} aria-label={name}>
        {initial}
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={name || "Talent profile photo"}
      className={styles.avatarImg}
      onError={() => setLoadError(true)}
      loading="lazy"
    />
  );
}

export function SpotlightTalentsWidget({ talents = [] }) {
  return (
    <Paper elevation={0} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <GroupsOutlinedIcon className={styles.headerIcon} />
          <div>
            <Typography component="h2" variant="h6" className={styles.title}>
              Spotlight Talent Roster
            </Typography>
            <Typography variant="caption" className={styles.subtitle}>
              Key represented creators & featured artists
            </Typography>
          </div>
        </div>

        <Button
          component={Link}
          href="/talents"
          size="small"
          endIcon={<ArrowForwardOutlinedIcon fontSize="inherit" />}
          className={styles.viewAllBtn}
        >
          View Roster
        </Button>
      </div>

      {talents.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No talents currently featured on the roster.</p>
          <Button
            component={Link}
            href="/talents?action=new"
            size="small"
            variant="outlined"
            startIcon={<PersonAddOutlinedIcon fontSize="small" />}
            className={styles.addBtn}
          >
            Add Talent
          </Button>
        </div>
      ) : (
        <div className={styles.talentList}>
          {talents.slice(0, 3).map((talent) => {
            const { category, avatarUrl } = getTalentMeta(talent);

            return (
              <div key={talent.id} className={styles.talentItem}>
                <div className={styles.avatarWrap}>
                  <TalentAvatar
                    key={`${talent.id}-${avatarUrl || "none"}`}
                    src={avatarUrl}
                    name={talent.title}
                  />
                </div>

                <div className={styles.talentInfo}>
                  <div className={styles.talentNameRow}>
                    <h3 className={styles.talentName}>{talent.title}</h3>
                    {talent.featured && (
                      <span className={styles.featuredBadge}>
                        <StarOutlinedIcon className={styles.starIcon} />
                        <span>Spotlight</span>
                      </span>
                    )}
                  </div>
                  <span className={styles.categoryBadge}>{category}</span>
                </div>

                <Link href={`/talents?edit=${talent.id}`} className={styles.profileLink}>
                  Profile
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </Paper>
  );
}
