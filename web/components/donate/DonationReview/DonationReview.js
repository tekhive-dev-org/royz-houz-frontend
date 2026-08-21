import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Lock, X, ChevronDown, Search } from "lucide-react";
import styles from "./DonationReview.module.css";

const COUNTRY_CODES = [
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬", placeholder: "465 126 2351" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸", placeholder: "(555) 000-0000" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧", placeholder: "07123 456789" },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭", placeholder: "024 123 4567" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪", placeholder: "0712 345 678" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦", placeholder: "082 123 4567" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦", placeholder: "(555) 000-0000" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪", placeholder: "050 123 4567" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷", placeholder: "06 12 34 56 78" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪", placeholder: "0151 12345678" },
];

/**
 * DonationReview component matching the 1440x874 SVG vector specification.
 * Summary card + Donor info card + Interactive Edit modal + Security badge + Paystack redirect flow.
 */
export function DonationReview({
  donationData,
  onBack,
  onUpdateData,
  onPaymentSuccess,
  onPaymentFailure,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit Donor Info State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(donationData?.fullName || "Donald Lawrence");
  const [editEmail, setEditEmail] = useState(donationData?.email || "donaldlawrence9@gmail.com");
  const [editPhone, setEditPhone] = useState(
    donationData?.phone ? donationData.phone.replace(/^\+\d+\s*/, "") : "465 126 2351"
  );
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveInfo = (e) => {
    e.preventDefault();
    const updated = {
      ...donationData,
      fullName: editName.trim() || "Donald Lawrence",
      email: editEmail.trim() || "donaldlawrence9@gmail.com",
      phone: `${selectedCountry.dial} ${editPhone.trim()}`,
    };
    if (onUpdateData) {
      onUpdateData(updated);
    }
    setIsEditingInfo(false);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate Paystack payment processing
    setTimeout(() => {
      setIsProcessing(false);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 1600);
  };

  const amountNumber = donationData?.amount || 25000;
  const formattedAmount = `₦${amountNumber.toLocaleString()}`;

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial.includes(countrySearch)
  );

  return (
    <section className={styles.section} aria-label="Review Your Donation">
      <div className={styles.container}>
        {/* ── Top Back Navigation Link ──────────────── */}
        <div className={styles.topNav}>
          <button type="button" onClick={onBack} className={styles.backBtn}>
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Donation Form</span>
          </button>
        </div>

        {/* ── Header with Gold Accent Bar ────────────── */}
        <div className={styles.header}>
          <span className={styles.accentBar} aria-hidden="true" />
          <div>
            <h2 className={styles.title}>Review Your Donation</h2>
            <p className={styles.subtitle}>
              Please confirm your donation details before proceedings to secure payment.
            </p>
          </div>
        </div>

        {/* ── 2-Column Review Grid ──────────────────── */}
        <div className={styles.grid}>
          {/* Left Column: Donation Summary Card (733px wide in spec) */}
          <div className={styles.leftCol}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryList}>
                {/* 1. Donation Type */}
                <div className={styles.summaryRow}>
                  <span className={styles.rowLabel}>Donation Type</span>
                  <span className={styles.rowValue}>
                    {donationData?.frequency === "one-time"
                      ? "One - Time Donation"
                      : donationData?.frequency === "monthly"
                      ? "Monthly Donation"
                      : "Sponsor a Talent"}
                  </span>
                </div>

                {/* 2. Amount */}
                <div className={styles.summaryRow}>
                  <span className={styles.rowLabel}>Amount</span>
                  <span className={styles.rowValue}>{formattedAmount}</span>
                </div>

                {/* 3. Cause */}
                <div className={styles.summaryRow}>
                  <span className={styles.rowLabel}>Cause</span>
                  <span className={styles.rowValue}>
                    {donationData?.cause || "Career skill development"}
                  </span>
                </div>

                {/* 4. Frequency */}
                <div className={styles.summaryRow}>
                  <span className={styles.rowLabel}>Frequency</span>
                  <span className={styles.rowValue}>
                    {donationData?.frequency === "one-time"
                      ? "One - Time"
                      : donationData?.frequency === "monthly"
                      ? "Monthly"
                      : "Recurring"}
                  </span>
                </div>

                {/* 5. Transaction Fee */}
                <div className={styles.summaryRow}>
                  <span className={styles.rowLabel}>Transaction Fee</span>
                  <span className={styles.rowValue}>₦ 0</span>
                </div>
              </div>

              {/* Total Divider */}
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>{formattedAmount}</span>
              </div>

              {/* Action: Continue to secure payment */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
                className={styles.payBtn}
              >
                <span>{isProcessing ? "Connecting to Paystack..." : "Continue to secure payment"}</span>
                {!isProcessing && <ArrowRight className="w-4 h-4" />}
              </button>

              {/* Test failure simulation link */}
              {onPaymentFailure && (
                <div className="flex justify-center -mt-2">
                  <button
                    type="button"
                    onClick={onPaymentFailure}
                    className="text-[11px] text-[#868C98] hover:text-rose-600 transition-colors underline cursor-pointer"
                  >
                    Simulate Payment Failure Response
                  </button>
                </div>
              )}

              {/* Redirect Notice */}
              <div className={styles.redirectNotice}>
                <Lock className="w-3.5 h-3.5 text-[#868C98]" />
                <span>You will be redirected paystack to complete your payment</span>
              </div>
            </div>
          </div>

          {/* Right Column: Donor Information & Security */}
          <div className={styles.rightCol}>
            {/* Card 1: Donor Information */}
            <div className={styles.donorCard}>
              <div className={styles.cardHeaderWithEdit}>
                <h3 className={styles.cardSectionTitle}>Donation Information</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(true)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
              </div>

              <div className={styles.donorInfoList}>
                <div className={styles.donorInfoRow}>
                  <span className={styles.donorLabel}>Full Name</span>
                  <span className={styles.donorValue}>
                    {donationData?.fullName || "Donald Lawrence"}
                  </span>
                </div>

                <div className={styles.donorInfoRow}>
                  <span className={styles.donorLabel}>Email Address</span>
                  <span className={styles.donorValue}>
                    {donationData?.email || "donaldlawrence9@gmail.com"}
                  </span>
                </div>

                <div className={styles.donorInfoRow}>
                  <span className={styles.donorLabel}>Phone Number</span>
                  <span className={styles.donorValue}>
                    {donationData?.phone || "+234 465 126 2351"}
                  </span>
                </div>
              </div>

              <div className={styles.cardSecurityNote}>
                <ShieldCheck className="w-4 h-4 text-[#868C98]" />
                <span>Your donation is secured and encrypted.</span>
              </div>
            </div>

            {/* Card 2: Your Donation is Secured Badge Card */}
            <div className={styles.securedBadgeCard}>
              <div className={styles.greenCheckCircle}>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className={styles.securedBody}>
                <h4 className={styles.securedTitle}>Your Donation is Secured</h4>
                <p className={styles.securedDesc}>
                  We use industry - standard security and paystack to process your
                  payment safely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit Donor Info Modal ─────────────────── */}
        {isEditingInfo && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <div className={styles.editModalHeader}>
                <h3 className={styles.modalTitle}>Edit Donation Information</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className={styles.closeBtn}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveInfo} className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-name" className={styles.inputLabel}>
                    Full Name
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit-email" className={styles.inputLabel}>
                    Email Address
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className={styles.textInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit-phone" className={styles.inputLabel}>
                    Phone Number
                  </label>
                  <div className={styles.phoneInputWrapper} ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryOpen((prev) => !prev)}
                      className={styles.flagPickerBtn}
                    >
                      <span>{selectedCountry.flag}</span>
                      <span className={styles.dialCode}>{selectedCountry.dial}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#868C98]" />
                    </button>

                    <input
                      id="edit-phone"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder={selectedCountry.placeholder}
                      className={styles.phoneInput}
                      required
                    />

                    {isCountryOpen && (
                      <div className={styles.countryDropdownMenu}>
                        <div className={styles.countrySearchWrap}>
                          <Search className="w-3.5 h-3.5 text-[#868C98]" />
                          <input
                            type="text"
                            placeholder="Search country..."
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
                              onClick={() => {
                                setSelectedCountry(c);
                                setIsCountryOpen(false);
                                setCountrySearch("");
                              }}
                              className={`${styles.countryOption} ${
                                selectedCountry.code === c.code ? styles.countryOptionActive : ""
                              }`}
                            >
                              <span className="mr-2 text-base">{c.flag}</span>
                              <span className="flex-1 truncate text-left">{c.name}</span>
                              <span className="text-[#868C98] font-medium">{c.dial}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.modalActionRow}>
                  <button
                    type="button"
                    onClick={() => setIsEditingInfo(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Save Information
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default DonationReview;
