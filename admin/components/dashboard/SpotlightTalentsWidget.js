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
      if (b.role) category = b.role;
      if (b.avatar || b.image) avatarUrl = b.avatar || b.image;
    }
  }

  return { category, avatarUrl };
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
            const initial = (talent.title || "T").charAt(0).toUpperCase();

            return (
              <div key={talent.id} className={styles.talentItem}>
                <div className={styles.avatarWrap}>
                  {avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={avatarUrl} alt={talent.title} className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>{initial}</div>
                  )}
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
