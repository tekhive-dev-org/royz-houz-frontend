import { useState, useRef, useEffect } from "react";
import { Mail, Phone, MapPin, Link as LinkIcon, ShieldCheck, Search, ChevronDown } from "lucide-react";
import {
  InstagramIcon,
  XIcon,
  YoutubeIcon,
  TikTokIcon,
} from "@/components/common/SocialIcons";
import { useGlobalLayout } from "@/hooks/useGlobalLayout";
import styles from "./ContactInfo.module.css";

const COUNTRY_CODES = [
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬", placeholder: "0801 234 5678" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸", placeholder: "(555) 000-0000" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧", placeholder: "07123 456789" },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭", placeholder: "024 123 4567" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪", placeholder: "0712 345 678" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦", placeholder: "082 123 4567" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦", placeholder: "(555) 000-0000" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪", placeholder: "050 123 4567" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷", placeholder: "06 12 34 56 78" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪", placeholder: "0151 12345678" },
  { code: "RW", name: "Rwanda", dial: "+250", flag: "🇷🇼", placeholder: "078 123 4567" },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬", placeholder: "070 123 4567" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺", placeholder: "0412 345 678" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳", placeholder: "98765 43210" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷", placeholder: "(11) 98765-4321" },
];

const CONTACT_REASONS = [
  "Select a reason",
  "General Inquiry",
  "Partnership / Collaboration",
  "Media / Press",
  "Talent Application",
  "Event Information",
  "Donation / Support",
  "Other",
];

/**
 * ContactInfo component with real-world standard international phone picker.
 */
export function ContactInfo() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });

  const { socialLinks, contactInfo } = useGlobalLayout();

  const emailValue = contactInfo?.email || "hello@royzhouz.com";
  const phoneValue = contactInfo?.phone || "+234 124 231 3542";
  const addressValue = contactInfo?.address || "Royz Houz Headquarters";

  const facebookUrl = socialLinks?.find((s) => s.platform === "facebook")?.url || "https://facebook.com";
  const youtubeUrl = socialLinks?.find((s) => s.platform === "youtube")?.url || "https://youtube.com";
  const instagramUrl = socialLinks?.find((s) => s.platform === "instagram")?.url || "https://instagram.com";
  const xUrl = socialLinks?.find((s) => s.platform === "x" || s.platform === "twitter")?.url || "https://x.com";
  const tiktokUrl = socialLinks?.find((s) => s.platform === "tiktok")?.url || "https://tiktok.com";

  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default Nigeria (+234)
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const dropdownRef = useRef(null);

  // Close country dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > 600) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setFormError("");
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
    setCountrySearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors = {};
    if (!formData.firstName.trim()) nextErrors.firstName = "Enter your first name.";
    if (!formData.email.trim()) nextErrors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!formData.message.trim()) nextErrors.message = "Enter your message.";

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitted(false);
    setFormError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim() || null,
          email: formData.email.trim(),
          phone: formData.phone.trim() ? `${selectedCountry.dial} ${formData.phone.trim()}` : null,
          countryCode: formData.phone.trim() ? selectedCountry.code : null,
          reason: formData.reason || null,
          message: formData.message.trim(),
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        const details = Array.isArray(payload?.error?.details) ? payload.error.details : [];
        const nextErrors = details.reduce((errors, detail) => {
          const field = String(detail?.field || "").split(".")[0];
          if (["firstName", "email", "message"].includes(field)) {
            errors[field] = "Please check this field.";
          }
          return errors;
        }, {});
        setFieldErrors(nextErrors);
        setFormError(payload?.error?.message || "We could not send your message. Please try again.");
        return;
      }

      setSubmitted(true);
      setFieldErrors({});
      setFormData({ firstName: "", lastName: "", email: "", phone: "", reason: "", message: "" });
    } catch {
      setFormError("We could not send your message. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial.includes(countrySearch) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <section className={styles.section} id="contact-info" aria-label="Contact Information">
      <div className={styles.container}>
        {/* ── Left Column: Contact Cards ────────────── */}
        <div className={styles.leftCol}>
          <div className={styles.leftHeader}>
            <h2 className={styles.leftTitle}>We&apos;re here to help.</h2>
            <p className={styles.leftSubtitle}>
              Our team is ready to connect with you and provide the support you need.
            </p>
          </div>

          <div className={styles.cardsGrid}>
            {/* 1. Email Us Card */}
            <div className={styles.contactCard}>
              <div className={styles.cardLeft}>
                <div className={styles.copperIconCircle}>
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className={styles.cardDetails}>
                  <h3 className={styles.cardLabel}>Email Us</h3>
                  <p className={styles.cardValue}>{emailValue}</p>
                  <p className={styles.cardSubtext}>We respond within 24 hours</p>
                </div>
              </div>
              <a
                href={`mailto:${emailValue}`}
                className={styles.pillActionBtn}
              >
                Chat for support
              </a>
            </div>

            {/* 2. Call Us Card */}
            <div className={styles.contactCard}>
              <div className={styles.cardLeft}>
                <div className={styles.copperIconCircle}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className={styles.cardDetails}>
                  <h3 className={styles.cardLabel}>Call Us</h3>
                  <p className={styles.cardValue}>{phoneValue}</p>
                  <p className={styles.cardSubtext}>Mon – Fri, 8:00AM – 5:00PM</p>
                </div>
              </div>
              <a
                href={`tel:${phoneValue.replace(/\s+/g, "")}`}
                className={styles.pillActionBtn}
              >
                Call our team
              </a>
            </div>

            {/* 3. Visit Us Card */}
            <div className={styles.contactCard}>
              <div className={styles.cardLeft}>
                <div className={styles.copperIconCircle}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className={styles.cardDetails}>
                  <h3 className={styles.cardLabel}>Visit Us</h3>
                  <p className={styles.cardValue}>{addressValue}</p>
                  <p className={styles.cardSubtext}>Lagos, Nigeria</p>
                </div>
              </div>
              <a
                href="#contact-map"
                className={styles.pillActionBtn}
              >
                Get directions
              </a>
            </div>

            {/* 4. Follow Us Card */}
            <div className={styles.contactCard}>
              <div className={styles.cardLeft}>
                <div className={styles.copperIconCircle}>
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <div className={styles.cardDetails}>
                  <h3 className={styles.cardLabel}>Follow Us</h3>
                  <div className={styles.socialIconsRow}>
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.socialCircleFb}
                      aria-label="Facebook"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.socialCircleYt}
                      aria-label="YouTube"
                    >
                      <YoutubeIcon className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.socialCircleIg}
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={xUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.socialCircleX}
                      aria-label="X"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.socialCircleTt}
                      aria-label="TikTok"
                    >
                      <TikTokIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Message Form ────────────── */}
        <div className={styles.rightCol}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Send Us a Message</h2>
            <p className={styles.formSubtitle}>
              Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Row 1: First & Last Name */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-first" className={styles.formLabel}>First name</label>
                  <input
                    id="contact-first"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={styles.formInput}
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    required
                  />
                  {fieldErrors.firstName && <p className={styles.errorMsg}>{fieldErrors.firstName}</p>}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-last" className={styles.formLabel}>Last name</label>
                  <input
                    id="contact-last"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone (Real-World Standard International Input) */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-email" className={styles.formLabel}>Email address</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={styles.formInput}
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                  {fieldErrors.email && <p className={styles.errorMsg}>{fieldErrors.email}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contact-phone" className={styles.formLabel}>Phone number</label>
                  <div className={styles.phoneInputWrapper} ref={dropdownRef}>
                    {/* Interactive Country Flag & Dial Code Selector */}
                    <button
                      type="button"
                      onClick={() => setIsCountryOpen((prev) => !prev)}
                      className={styles.flagPickerBtn}
                      aria-haspopup="listbox"
                      aria-expanded={isCountryOpen}
                      title="Select country code"
                    >
                      <span className={styles.flagEmoji}>{selectedCountry.flag}</span>
                      <span className={styles.dialCodeText}>{selectedCountry.dial}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#868C98] transition-transform ${isCountryOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Phone Number Input */}
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={selectedCountry.placeholder}
                      className={styles.phoneInput}
                    />

                    {/* Dropdown Country List */}
                    {isCountryOpen && (
                      <div className={styles.countryDropdownMenu} role="listbox">
                        <div className={styles.countrySearchWrap}>
                          <Search className="w-3.5 h-3.5 text-[#868C98]" />
                          <input
                            type="text"
                            placeholder="Search country or code..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className={styles.countrySearchInput}
                            autoFocus
                          />
                        </div>

                        <div className={styles.countryListScroll}>
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => handleCountrySelect(c)}
                              className={`${styles.countryOption} ${
                                selectedCountry.code === c.code ? styles.countryOptionActive : ""
                              }`}
                              role="option"
                              aria-selected={selectedCountry.code === c.code}
                            >
                              <span className={styles.countryOptionFlag}>{c.flag}</span>
                              <span className={styles.countryOptionName}>{c.name}</span>
                              <span className={styles.countryOptionDial}>{c.dial}</span>
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <div className={styles.noCountryMatch}>
                              No matching country found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Reason for Contact */}
              <div className={styles.formGroup}>
                <label htmlFor="contact-reason" className={styles.formLabel}>Reason for Contact</label>
                <select
                  id="contact-reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  {CONTACT_REASONS.map((reason) => (
                    <option key={reason} value={reason === "Select a reason" ? "" : reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: Message */}
              <div className={styles.formGroup}>
                <label htmlFor="contact-message" className={styles.formLabel}>Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Leave us a message"
                  rows={4}
                  className={styles.formTextarea}
                  aria-invalid={Boolean(fieldErrors.message)}
                  required
                />
                {fieldErrors.message && <p className={styles.errorMsg}>{fieldErrors.message}</p>}
                <span className={styles.charCount}>
                  {formData.message.length}/600
                </span>
              </div>

              {/* Submit */}
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? "Sending Message..." : "Send Message"}
              </button>

              {submitted && (
                <p className={styles.successMsg} role="status">
                  ✓ Message sent successfully! We&apos;ll get back to you soon.
                </p>
              )}
              {formError && <p className={styles.errorMsg} role="alert">{formError}</p>}

              <div className={styles.privacyNote}>
                <ShieldCheck className="w-3.5 h-3.5 text-[#868C98] shrink-0" />
                <span>Your information is safe with us. We respect your privacy</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactInfo;
