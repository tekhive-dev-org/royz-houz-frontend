import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { DOCS_CHAPTERS } from "@/constants/docsData";
import styles from "./Docs.module.css";

export function DocsPagination({ currentSlug }) {
  const currentIndex = DOCS_CHAPTERS.findIndex((c) => c.slug === currentSlug);
  const prevChapter = currentIndex > 0 ? DOCS_CHAPTERS[currentIndex - 1] : null;
  const nextChapter = currentIndex < DOCS_CHAPTERS.length - 1 ? DOCS_CHAPTERS[currentIndex + 1] : null;

  if (!prevChapter && !nextChapter) return null;

  return (
    <nav className={styles.pagination} aria-label="Chapter Navigation">
      {prevChapter ? (
        <Link href={`/docs/${prevChapter.slug}`} className={styles.navBtn}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowBackIcon fontSize="inherit" sx={{ color: "#64748B" }} />
            <span className={styles.navBtnLabel}>Previous Topic</span>
          </div>
          <span className={styles.navBtnTitle}>{prevChapter.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {nextChapter && (
        <Link
          href={`/docs/${nextChapter.slug}`}
          className={styles.navBtn}
          style={{ textAlign: "right", marginLeft: "auto" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
            <span className={styles.navBtnLabel}>Next Topic</span>
            <ArrowForwardIcon fontSize="inherit" sx={{ color: "#64748B" }} />
          </div>
          <span className={styles.navBtnTitle}>{nextChapter.title}</span>
        </Link>
      )}
    </nav>
  );
}
