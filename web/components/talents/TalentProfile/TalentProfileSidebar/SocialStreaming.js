import styles from "./TalentProfileSidebar.module.css";

/**
 * SocialStreaming sidebar widget rendering exact Figma brand icons.
 */
export function SocialStreaming({ talent }) {
  const socials = [
    {
      name: "Facebook",
      href: talent?.socials?.facebook || "https://facebook.com",
      renderIcon: () => (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fb_grad" x1="16" y1="32" x2="16" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0062E0" />
              <stop offset="1" stopColor="#19AFFF" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="16" fill="url(#fb_grad)" />
          <path d="M16 2.07C8.3 2.07 2 8.4 2 16.14C2 23.08 7.14 28.85 13.76 30.07V20.08H10.26V16.14H13.76V13.04C13.76 9.53 16 7.56 19.22 7.56C20.2 7.56 21.32 7.7 22.3 7.84V11.43H20.48C18.8 11.43 18.38 12.27 18.38 13.4V16.14H22.09L21.46 20.08H18.38V30.06C24.99 28.83 30 23.08 30 16.14C30 8.4 23.7 2.07 16 2.07Z" fill="white" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: talent?.socials?.youtube || "https://youtube.com",
      renderIcon: () => (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#FF0000" />
          <path d="M23.6 12.1C23.4 11.4 22.9 10.9 22.2 10.7C21 10.4 15.9 10.4 15.9 10.4C15.9 10.4 10.9 10.4 9.6 10.7C8.9 10.9 8.4 11.4 8.2 12.1C8 13.4 8 16 8 16C8 16 8 18.6 8.3 19.9C8.5 20.6 9 21.1 9.7 21.3C10.9 21.6 16 21.6 16 21.6C16 21.6 21 21.6 22.3 21.3C23 21.1 23.5 20.6 23.7 19.9C24 18.6 24 16 24 16C24 16 24 13.4 23.6 12.1ZM14.4 18.4V13.6L18.6 16L14.4 18.4Z" fill="white" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: talent?.socials?.instagram || "https://instagram.com",
      renderIcon: () => (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ig_grad1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(8.5 34.46) rotate(-90) scale(31.71 29.5)">
              <stop stopColor="#FFDD55" />
              <stop offset="0.1" stopColor="#FFDD55" />
              <stop offset="0.5" stopColor="#FF543E" />
              <stop offset="1" stopColor="#C837AB" />
            </radialGradient>
            <radialGradient id="ig_grad2" cx="0" cy="0" r="1" gradientTransform="matrix(2.78 13.9 -57.3 11.48 -5.36 2.31)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3771C8" />
              <stop offset="0.128" stopColor="#3771C8" />
              <stop offset="1" stopColor="#6600FF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="16" fill="url(#ig_grad1)" />
          <circle cx="16" cy="16" r="16" fill="url(#ig_grad2)" />
          <path d="M16 9.2C18.2 9.2 18.5 9.2 19.4 9.2C20.2 9.2 20.6 9.4 20.9 9.5C21.3 9.7 21.6 9.8 21.9 10.1C22.2 10.4 22.4 10.7 22.5 11.1C22.6 11.4 22.7 11.8 22.8 12.6C22.8 13.5 22.8 13.7 22.8 16C22.8 18.3 22.8 18.5 22.8 19.4C22.8 20.2 22.6 20.6 22.5 20.9C22.3 21.3 22.2 21.6 21.9 21.9C21.6 22.2 21.3 22.4 20.9 22.5C20.6 22.6 20.2 22.7 19.4 22.8C18.5 22.8 18.3 22.8 16 22.8C13.7 22.8 13.5 22.8 12.6 22.8C11.8 22.8 11.4 22.6 11.1 22.5C10.7 22.3 10.4 22.2 10.1 21.9C9.8 21.6 9.6 21.3 9.5 20.9C9.4 20.6 9.3 20.2 9.2 19.4C9.2 18.5 9.2 18.3 9.2 16C9.2 13.7 9.2 13.5 9.2 12.6C9.2 11.8 9.4 11.4 9.5 11.1C9.7 10.7 9.8 10.4 10.1 10.1C10.4 9.8 10.7 9.6 11.1 9.5C11.4 9.4 11.8 9.3 12.6 9.2C13.5 9.2 13.7 9.2 16 9.2ZM16 7.7C13.7 7.7 13.5 7.7 12.6 7.7C11.7 7.7 11.1 7.9 10.6 8.1C10.1 8.3 9.6 8.6 9.1 9.1C8.6 9.6 8.4 10 8.1 10.6C7.9 11.1 7.8 11.7 7.7 12.6C7.7 13.5 7.7 13.8 7.7 16C7.7 18.3 7.7 18.5 7.7 19.4C7.7 20.3 7.9 20.9 8.1 21.4C8.3 21.9 8.6 22.4 9.1 22.9C9.6 23.4 10 23.6 10.6 23.9C11.1 24.1 11.7 24.2 12.6 24.3C13.5 24.3 13.8 24.3 16 24.3C18.2 24.3 18.5 24.3 19.4 24.3C20.3 24.3 20.9 24.1 21.4 23.9C21.9 23.7 22.4 23.4 22.9 22.9C23.4 22.4 23.6 22 23.9 21.4C24.1 20.9 24.2 20.3 24.3 19.4C24.3 18.5 24.3 18.2 24.3 16C24.3 13.8 24.3 13.5 24.3 12.6C24.3 11.7 24.1 11.1 23.9 10.6C23.7 10.1 23.4 9.6 22.9 9.1C22.4 8.6 22 8.4 21.4 8.1C20.9 7.9 20.3 7.8 19.4 7.7C18.5 7.7 18.2 7.7 16 7.7Z" fill="white" />
          <path d="M16 11.7C13.6 11.7 11.7 13.6 11.7 16C11.7 18.4 13.6 20.3 16 20.3C18.4 20.3 20.3 18.4 20.3 16C20.3 13.6 18.4 11.7 16 11.7ZM16 18.8C14.5 18.8 13.2 17.6 13.2 16C13.2 14.5 14.5 13.2 16 13.2C17.5 13.2 18.8 14.5 18.8 16C18.8 17.6 17.5 18.8 16 18.8Z" fill="white" />
          <circle cx="20.4" cy="11.6" r="1" fill="white" />
        </svg>
      ),
    },
    {
      name: "X",
      href: talent?.socials?.twitter || "https://x.com",
      renderIcon: () => (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="black" />
          <path d="M17.52 14.77L23.48 8H22.07L16.9 13.88L12.76 8H8L14.25 16.9L8 24H9.41L14.87 17.79L19.24 24H24L17.52 14.77ZM15.59 16.97L14.96 16.09L9.92 9.04H12.09L16.15 14.73L16.78 15.61L22.07 23.01H19.9L15.59 16.97Z" fill="white" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: talent?.socials?.tiktok || "https://tiktok.com",
      renderIcon: () => (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="black" />
          <path d="M14.5 14.3V13.68C14.29 13.65 14.07 13.63 13.84 13.63C11.17 13.63 9 15.8 9 18.48C9 20.12 9.82 21.57 21.07 22.45C20.26 21.59 19.77 20.42 19.77 19.15C19.77 16.51 21.88 14.36 24.5 14.3Z" fill="#25F4EE" />
          <path d="M14.62 21.36C15.81 21.36 16.78 20.41 16.82 19.23L16.83 8.67H18.76C18.72 8.45 18.7 8.23 18.7 8H16.06L16.06 18.56C16.02 19.74 15.04 20.69 13.85 20.69C13.48 20.69 13.13 20.6 12.82 20.44C13.22 21 13.88 21.36 14.62 21.36Z" fill="#25F4EE" />
          <path d="M22.36 12.25V11.67C21.62 11.67 20.94 11.45 20.36 11.07C20.88 11.66 21.57 12.09 22.36 12.25Z" fill="#25F4EE" />
          <path d="M20.36 11.07C19.8 10.43 19.46 9.59 19.46 8.67H18.76C18.94 9.67 19.54 10.54 20.36 11.07Z" fill="#FE2C55" />
          <path d="M13.85 16.26C12.63 16.26 11.64 17.25 11.64 18.48C11.64 19.33 12.12 20.07 12.82 20.44C12.56 20.07 12.4 19.63 12.4 19.14C12.4 17.92 13.39 16.93 14.61 16.93C14.84 16.93 15.06 16.97 15.27 17.03V14.34C15.06 14.31 14.84 14.3 14.61 14.3C14.58 14.3 14.54 14.3 14.5 14.3V16.36C14.29 16.3 14.07 16.26 13.85 16.26Z" fill="#FE2C55" />
          <path d="M22.36 12.25V14.3C20.99 14.3 19.73 13.86 18.7 13.12V18.48C18.7 21.15 16.52 23.33 13.85 23.33C12.82 23.33 11.86 23 11.07 22.45C11.96 23.4 13.22 24 14.62 24C17.29 24 19.46 21.83 19.46 19.15V13.79C20.49 14.53 21.76 14.97 23.13 14.97V12.34C22.86 12.34 22.6 12.31 22.36 12.25Z" fill="#FE2C55" />
          <path d="M18.7 18.48V13.12C19.73 13.86 21 14.3 22.36 14.3V12.25C21.57 12.09 20.88 11.66 20.36 11.07C19.54 10.54 18.94 9.67 18.76 8.67H16.83L16.82 19.23C16.78 20.41 15.81 21.36 14.62 21.36C13.88 21.36 13.22 21 12.82 20.44C12.12 20.07 11.63 19.33 11.63 18.48C11.63 17.26 12.62 16.27 13.84 16.27C14.07 16.27 14.29 16.31 14.5 16.37V14.3C11.88 14.36 9.77 16.51 9.77 19.15C9.77 20.42 10.26 21.58 11.07 22.45C11.86 23 12.82 23.33 13.85 23.33C16.52 23.33 18.7 21.15 18.7 18.48Z" fill="white" />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.socialWidget} aria-label="Social and Streaming Links">
      <h3 className={styles.widgetHeader}>Social & Streaming</h3>

      <div className={styles.socialList}>
        {socials.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIconBtn}
            aria-label={item.name}
          >
            {item.renderIcon()}
          </a>
        ))}
      </div>
    </div>
  );
}

export default SocialStreaming;
