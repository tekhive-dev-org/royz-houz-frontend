import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Search, Menu, X, Instagram } from "lucide-react";
import { XIcon, YoutubeIcon } from "@/components/common/SocialIcons";
import styles from "./Header.module.css";

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Talent Hub", href: "/talents" },
    { label: "Events", href: "/events" },
    { label: "Media", href: "/media" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* Brand Logo */}
        <Link href="/" className={`${styles.logoLink} group`}>
          <Image
            src="/logo.png"
            alt="RoyzHouse Logo"
            width={160}
            height={44}
            className={styles.logoImage}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {item.label}
                {isActive && <span className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Search, Socials, Donate Button) */}
        <div className={styles.actionsGroup}>
          {/* Search */}
          <div className={styles.searchContainer}>
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Search talents, events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className={styles.searchInput}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className={styles.closeSearchBtn}
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className={styles.openSearchBtn}
                aria-label="Open Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Social Icons */}
          <div className={styles.socialGroup}>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
              aria-label="X"
            >
              <XIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
              aria-label="YouTube"
            >
              <YoutubeIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Donate CTA Button */}
          <Link href="/donate" className={styles.donateBtn}>
            Donate
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className={styles.mobileActions}>
          <Link href="/donate" className={styles.mobileDonateBtn}>
            Donate
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.mobileToggleBtn}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`${styles.mobileNavLink} ${
                  router.pathname === item.href ? styles.mobileNavLinkActive : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Drawer Search Bar when open */}
          {mobileSearchOpen && (
            <form onSubmit={handleSearchSubmit} className={styles.mobileSearchForm}>
              <input
                type="text"
                placeholder="Search talents, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={styles.mobileSearchInput}
              />
              <button type="submit" className={styles.mobileSearchSubmitBtn}>
                Search
              </button>
            </form>
          )}

          <div className={styles.mobileDrawerFooter}>
            <div className={styles.mobileSocialGroup}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer">
                <XIcon className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className={mobileSearchOpen ? "text-[#B46A2C]" : "text-[#A3A3A3] hover:text-[#B46A2C]"}
              aria-label="Toggle mobile search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
