import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import styles from "./ArticleHeader.module.css";

/**
 * ArticleHeader displays breadcrumbs, cover image, category badge,
 * article title, author meta row, and exact social share actions (X, WhatsApp, Instagram, Link).
 */
export function ArticleHeader({ article }) {
  const [copied, setCopied] = useState(false);

  const title =
    article?.title ||
    `${article?.titlePrefix || ""} ${article?.titleHighlight || "How We Empowered 500 Young Nigerians Through Creative Education"}`;

  const handleCopyLink = async () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const shareText = encodeURIComponent(`Read "${title}" on Royz Houz`);

  return (
    <header className={styles.header}>
      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <ol className={styles.breadcrumbList}>
          <li>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator}>&gt;</li>
          <li>
            <Link href="/blog" className={styles.breadcrumbLink}>
              Blog
            </Link>
          </li>
          <li className={styles.breadcrumbSeparator}>&gt;</li>
          <li className={styles.breadcrumbCurrent} aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      {/* Featured Cover Image */}
      <div className={styles.coverImageFrame}>
        <div className={styles.coverImageContainer}>
          <Image
            src={article?.image || article?.backgroundImage || "/assets/img/blog/post-ballet.jpg"}
            alt={title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className={styles.coverImage}
          />
        </div>
      </div>

      {/* Title & Metadata Area */}
      <div className={styles.metaArea}>
        <div className={styles.categoryBadge}>
          {article?.category || "IMPACT"}
        </div>

        <h1 className={styles.title}>{title}</h1>

        {/* Author + Social Actions Bar (1034x98 design) */}
        <div className={styles.authorSocialRow}>
          {/* Author info */}
          <div className={styles.authorInfo}>
            <div className={styles.authorAvatarRing}>
              <div className={styles.authorAvatarContainer}>
                <Image
                  src="/assets/img/blog/author-chisom.jpg"
                  alt="Chisom Obi"
                  fill
                  className={styles.authorAvatar}
                />
              </div>
            </div>
            <div className={styles.authorText}>
              <span className={styles.authorName}>
                {article?.author || "Chisom Obi"}
              </span>
              <span className={styles.metaSubtitle}>
                {article?.date || "July 28, 2024"} · {article?.readTime || "6 min read"}
              </span>
            </div>
          </div>

          {/* Social Share & Copy Actions */}
          <div className={styles.socialActions} aria-label="Share story">
            {/* X / Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconBtn}
              title="Share on X"
              aria-label="Share on X"
            >
              <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.328 0H16.085L10.063 6.88333L17.147 16.25H11.6L7.672 11.0575L3.171 16.25H0.412L6.859 8.8875L0 0H5.673L9.222 4.69167L13.328 0ZM12.361 14.6H13.888L4.028 1.56333H2.389L12.361 14.6Z" fill="currentColor"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}%20${currentUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconBtn}
              title="Share on WhatsApp"
              aria-label="Share on WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.559 11.985C14.312 11.8609 13.094 11.2625 12.868 11.1792C12.64 11.0967 12.475 11.0559 12.309 11.3042C12.145 11.5517 11.67 12.1092 11.526 12.2742C11.382 12.44 11.237 12.46 10.989 12.3367C10.742 12.2117 9.944 11.9509 8.998 11.1075C8.262 10.4509 7.764 9.64 7.62 9.39167C7.476 9.14417 7.605 9.01 7.729 8.88667C7.84 8.77583 7.977 8.5975 8.1 8.45333C8.224 8.30833 8.265 8.205 8.349 8.03917C8.431 7.87417 8.39 7.73 8.328 7.60583C8.265 7.48167 7.77 6.2625 7.564 5.76667C7.363 5.28417 7.159 5.35 7.007 5.34167C6.863 5.335 6.698 5.33333 6.532 5.33333C6.367 5.33333 6.099 5.395 5.872 5.64333C5.645 5.89083 5.005 6.49 5.005 7.70917C5.005 8.9275 5.893 10.105 6.016 10.2708C6.14 10.4358 7.763 12.9375 10.247 14.01C10.838 14.265 11.299 14.4175 11.659 14.5308C12.252 14.72 12.792 14.6933 13.218 14.6292C13.694 14.5583 14.683 14.03 14.889 13.4517C15.096 12.8733 15.096 12.3775 15.034 12.2742C14.972 12.1708 14.808 12.1092 14.559 11.985ZM10.041 18.1542H10.038C8.563 18.1543 7.114 17.7577 5.845 17.0058L5.544 16.8275L2.427 17.6458L3.259 14.6058L3.063 14.2942C2.238 12.9811 1.802 11.4614 1.804 9.91083C1.805 5.36917 5.501 1.67417 10.044 1.67417C12.244 1.67417 14.313 2.5325 15.868 4.08917C16.635 4.85304 17.243 5.76152 17.657 6.7619C18.071 7.76228 18.282 8.83492 18.279 9.9175C18.276 14.4592 14.581 18.1542 10.041 18.1542ZM17.052 2.90667C16.134 1.9825 15.041 1.2496 13.838 0.750719C12.634 0.251838 11.344 -0.00336154 10.041 3.32832e-06C4.579 3.32832e-06 0.133 4.44584 0.13 9.91C0.13 11.6567 0.586 13.3617 1.454 14.8642L0.047 20L5.301 18.6217C6.754 19.4133 8.382 19.8282 10.037 19.8283H10.041C15.503 19.8283 19.949 15.3825 19.952 9.9175C19.956 8.6153 19.702 7.32514 19.204 6.12173C18.706 4.91833 17.975 3.82563 17.052 2.90667Z" fill="currentColor"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconBtn}
              title="Share on Instagram"
              aria-label="Share on Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1.8025C12.67 1.8025 12.987 1.8125 14.042 1.86083C16.752 1.98417 18.02 3.27 18.14 5.96C18.19 7.01417 18.2 7.33083 18.2 10.0008C18.2 12.6717 18.19 12.9875 18.14 14.0417C18.02 16.7292 16.754 18.0175 14.042 18.1408C12.987 18.1892 12.672 18.1992 10 18.1992C7.33 18.1992 7.013 18.1892 5.959 18.1408C3.243 18.0167 1.983 16.725 1.86 14.0408C1.812 12.9867 1.802 12.6708 1.802 10C1.802 7.33 1.812 7.01417 1.86 5.95917C1.984 3.27 3.247 1.98333 5.959 1.86C7.014 1.8125 7.33 1.8025 10 1.8025ZM10 0C7.284 0 6.944 0.0116667 5.878 0.06C2.246 0.226667 0.227 2.24167 0.061 5.87667C0.012 6.94417 0 7.28417 0 10C0 12.7158 0.012 13.0567 0.06 14.1233C0.227 17.755 2.242 19.7733 5.877 19.94C6.944 19.9883 7.284 20 10 20C12.716 20 13.057 19.9883 14.123 19.94C17.752 19.7733 19.77 17.7583 19.94 14.1233C19.99 13.0567 20 12.7158 20 10C20 7.28417 19.99 6.94417 19.94 5.8775C19.78 2.24917 17.759 0.2275 14.124 0.0608333C13.057 0.0116667 12.716 0 10 0ZM10 4.865C7.164 4.865 4.865 7.16417 4.865 10C4.865 12.8358 7.164 15.1358 10 15.1358C12.836 15.1358 15.135 12.8367 15.135 10C15.135 7.16417 12.836 4.865 10 4.865ZM10 13.3333C8.159 13.3333 6.667 11.8417 6.667 10C6.667 8.15917 8.159 6.66667 10 6.66667C11.841 6.66667 13.333 8.15917 13.333 10C13.333 11.8417 11.841 13.3333 10 13.3333ZM15.338 3.4625C14.675 3.4625 14.137 4 14.137 4.6625C14.137 5.325 14.675 5.8625 15.338 5.8625C16.001 5.8625 16.537 5.325 16.537 4.6625C16.537 4 16.001 3.4625 15.338 3.4625Z" fill="currentColor"/>
              </svg>
            </a>

            {/* Link / Copy URL */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={styles.socialIconBtn}
              title="Copy link"
              aria-label="Copy story link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.52 6.4748C7.9 5.8499 7.05 5.4988 6.17 5.4988C5.28 5.4988 4.44 5.8499 3.81 6.4748L0.48 9.8081C0.16 10.1156 -0.1 10.4834 -0.27 10.8901C-0.45 11.2968 -0.54 11.7342 -0.54 12.1768C-0.54 12.6194 -0.46 13.0583 -0.29 13.4679C-0.13 13.8776 0.12 14.2498 0.44 14.5628C0.75 14.8757 1.12 15.1232 1.53 15.2908C1.94 15.4584 2.38 15.5428 2.82 15.5389C3.26 15.5351 3.7 15.4431 4.11 15.2684C4.51 15.0937 4.88 14.8398 5.19 14.5214L6.11 13.6039M5.48 9.5214C6.1 10.1463 6.95 10.4974 7.83 10.4974C8.72 10.4974 9.56 10.1463 10.19 9.5214L13.52 6.1881C14.13 5.5594 14.47 4.7174 14.46 3.8434C14.45 2.9694 14.1 2.1334 13.48 1.5154C12.86 0.8973 12.03 0.5468 11.15 0.5392C10.28 0.5316 9.44 0.8676 8.81 1.4748L7.89 2.3914" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" transform="translate(1, 0)"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ArticleHeader;
