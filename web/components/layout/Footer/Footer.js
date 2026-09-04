import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MapPin, Mail, Phone, Globe } from "lucide-react";
import { InstagramIcon, XIcon, YoutubeIcon, TikTokIcon } from "@/components/common/SocialIcons";
import { useGlobalLayout } from "@/hooks/useGlobalLayout";
import styles from "./Footer.module.css";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");

  const { socialLinks, contactInfo, footerSections } = useGlobalLayout();

  const instagramUrl = socialLinks?.find((s) => s.platform === "instagram")?.url || "https://instagram.com";
  const xUrl = socialLinks?.find((s) => s.platform === "x" || s.platform === "twitter")?.url || "https://x.com";
  const youtubeUrl = socialLinks?.find((s) => s.platform === "youtube")?.url || "https://youtube.com";
  const tiktokUrl = socialLinks?.find((s) => s.platform === "tiktok")?.url || "https://tiktok.com";

  const address = contactInfo?.address || "Jl. Sunset Road No.815, Bali";
  const contactEmail = contactInfo?.email || "contact@royzhouz.com";
  const contactPhone = contactInfo?.phone || "+234 81 602 320 43";
  const website = contactInfo?.website || "https://royzhouz.com";

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || isSubscribing) return;
    setIsSubscribing(true);
    setSubscriptionError("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), source: "footer" }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) throw new Error(payload?.error?.message || "Unable to subscribe right now.");
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    } catch (error) {
      setSubscriptionError(error.message || "Unable to subscribe right now.");
    } finally {
      setIsSubscribing(false);
    }
  };


  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Main Footer Columns */}
        <div className={styles.columnsGrid}>
          
          {/* Column 1: Logo & Description */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/logo.png"
                alt="RoyzHouse Logo"
                width={160}
                height={44}
                className={styles.logoImage}
              />
              <span>ROYZ HOUZ</span>
            </Link>

            <p className={styles.brandDesc}>
              An African creative ecosystem dedicated to discovering, empowering, and promoting Africa&apos;s most extraordinary creatives across music, film, fashion, art, and innovation.
            </p>

            {/* Social Icons (Square bordered) */}
            <div className={styles.socialSquareGroup}>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.socialSquareLink}
                aria-label="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={xUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.socialSquareLink}
                aria-label="X"
              >
                <XIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.socialSquareLink}
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.socialSquareLink}
                aria-label="TikTok"
              >
                <TikTokIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Dynamic Footer Sections or Default Columns */}
          {footerSections && footerSections.length > 0 ? (
            footerSections.slice(0, 2).map((section) => (
              <div key={section.id || section.slug} className={styles.navCol}>
                <h4 className={styles.colHeader}>{section.title}</h4>
                <ul className={styles.navList}>
                  {(section.links || []).map((link) => (
                    <li key={link.id || link.label}>
                      <Link href={link.href || "/"} className={styles.navLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              {/* Column 2: Explore */}
              <div className={styles.navCol}>
                <h4 className={styles.colHeader}>Explore</h4>
                <ul className={styles.navList}>
                  <li>
                    <Link href="/" className={styles.navLink}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className={styles.navLink}>
                      About Royz Houz
                    </Link>
                  </li>
                  <li>
                    <Link href="/talents" className={styles.navLink}>
                      Talent Hub
                    </Link>
                  </li>
                  <li>
                    <Link href="/events" className={styles.navLink}>
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link href="/media" className={styles.navLink}>
                      Media Hub
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Community */}
              <div className={styles.navCol}>
                <h4 className={styles.colHeader}>Community</h4>
                <ul className={styles.navList}>
                  <li>
                    <Link href="/impact" className={styles.navLink}>
                      Our Impact
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className={styles.navLink}>
                      Blog / Journal
                    </Link>
                  </li>
                  <li>
                    <Link href="/donate" className={styles.navLink}>
                      Donate
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className={styles.navLink}>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/merchandise" className={styles.navLink}>
                      Merchandise
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Column 4: Contact Info */}
          <div className={styles.navCol}>
            <h4 className={styles.colHeader}>Contact Info</h4>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <MapPin className={styles.contactIcon} />
                <span>{address}</span>
              </li>
              <li className={styles.contactItemCenter}>
                <Mail className={styles.contactIconCenter} />
                <a href={`mailto:${contactEmail}`} className={styles.navLink}>
                  {contactEmail}
                </a>
              </li>
              <li className={styles.contactItemCenter}>
                <Phone className={styles.contactIconCenter} />
                <a href={`tel:${contactPhone.replace(/\s+/g, "")}`} className={styles.navLink}>
                  {contactPhone}
                </a>
              </li>
              <li className={styles.contactItemCenter}>
                <Globe className={styles.contactIconCenter} />
                <a href={website} target="_blank" rel="noreferrer" className={styles.navLink}>
                  {website}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Subscribe Newsletter Section Box */}
        <div className={styles.newsletterBox}>
          <div className={styles.newsletterTextGroup}>
            <h3 className={styles.newsletterTitle}>
              Subscribe Newsletter
            </h3>
            <p className={styles.newsletterSubtitle}>
              Get weekly insights, talent spotlights, event invites, and opportunities delivered to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
            <div className={styles.newsletterInputWrapper}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.newsletterInput}
              />
              <button type="submit" className={styles.newsletterSubmitBtn} disabled={isSubscribing}>
                {isSubscribing ? "Subscribing…" : "Subscribe"}
              </button>
            </div>
            {subscribed && <p className={styles.successText}>Thank you for subscribing!</p>}
            {subscriptionError && <p className={styles.errorText}>{subscriptionError}</p>}
          </form>
        </div>

        {/* Bottom Copyright Bar */}
        <div className={styles.copyrightBar}>
          <div>
            Copyright &copy; 2026 ROYZHOUZ. All Rights Reserved
          </div>

          {/* Legal Links */}
          <div className={styles.legalLinksGroup}>
            <Link href="/terms" className={styles.legalLink}>
              Terms &amp; Conditions
            </Link>
            <span>|</span>
            <Link href="/privacy" className={styles.legalLink}>
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
