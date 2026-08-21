import { useState, useRef, useEffect } from "react";
import { ShieldCheck, ChevronDown, Search } from "lucide-react";
import styles from "./DonationForm.module.css";

const FREQUENCIES = [
  { id: "one-time", label: "One-time Donation" },
  { id: "monthly", label: "Monthly Donation" },
  { id: "sponsor", label: "Sponsor a Talent" },
];

const PRESET_AMOUNTS = [15000, 25000, 35000, 45000];

const CAUSES = [
  "Career skill development",
  "Music & Arts Equipment",
  "Youth Education & Mentorship",
  "Community Creative Centers",
  "Emerging Talent Grants",
  "General Foundation Support",
];

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
 * DonationForm component with split layout:
 * - Left side: Giving Options (Frequency, Amount, Custom Amount, Cause)
 * - Right side: Information Form (Full Name, Email, Phone Number, Submit CTA, Security Badge)
 */
export function DonationForm({ initialData, onProceedToReview }) {
  const [frequency, setFrequency] = useState(initialData?.frequency || "one-time");
  const [amount, setAmount] = useState(initialData?.amount || 25000);
  const [customAmount, setCustomAmount] = useState(initialData?.customAmount || "");
  const [cause, setCause] = useState(initialData?.cause || CAUSES[0]);

  // Donor Information (Right Column)
  const [fullName, setFullName] = useState(initialData?.fullName || "Donald Lawrence");
  const [email, setEmail] = useState(initialData?.email || "donaldlawrence9@gmail.com");
  const [phone, setPhone] = useState(
    initialData?.phone ? initialData.phone.replace(/^\+\d+\s*/, "") : "465 126 2351"
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

  const handlePresetSelect = (val) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(rawVal);
    if (rawVal) {
      setAmount(Number(rawVal));
    } else {
      setAmount(25000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    const formattedData = {
      ...(initialData || {}),
      frequency,
      frequencyLabel:
        FREQUENCIES.find((f) => f.id === frequency)?.label || "One-Time Donation",
      amount,
      customAmount,
      cause,
      fullName: fullName.trim() || "Donald Lawrence",
      email: email.trim() || "donaldlawrence9@gmail.com",
      phone: `${selectedCountry.dial} ${phone.trim()}`,
    };

    onProceedToReview(formattedData);
  };

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial.includes(countrySearch)
  );

  return (
    <section className={styles.section} id="make-a-donation" aria-label="Make a Donation">
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.cardGrid}>
          {/* ── Left Column: Giving Parameters Card ────── */}
          <div className={styles.leftCard}>
            {/* Header with #DCA43E Gold Accent Bar */}
            <div className={styles.header}>
              <span className={styles.accentBar} aria-hidden="true" />
              <div>
                <h2 className={styles.title}>Make A Donation</h2>
                <p className={styles.subtitle}>Choose how you would like to give.</p>
              </div>
            </div>

            {/* Step 1: Frequency Tabs (55px high) */}
            <div className={styles.freqRow}>
              {FREQUENCIES.map((f) => {
                const isActive = frequency === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrequency(f.id)}
                    className={`${styles.freqBtn} ${
                      isActive ? styles.freqBtnActive : styles.freqBtnInactive
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Step 2: Choose an Amount (55px high) */}
            <div className={styles.formGroup}>
              <label className={styles.sectionLabel}>
                Choose an Amount <span className={styles.nairaSymbol}>₦</span>
              </label>
              <div className={styles.amountGrid}>
                {PRESET_AMOUNTS.map((val) => {
                  const isSelected = amount === val && !customAmount;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`${styles.amountBtn} ${
                        isSelected ? styles.amountBtnActive : styles.amountBtnInactive
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Custom Amount (64px high) */}
            <div className={styles.formGroup}>
              <label htmlFor="custom-amount" className={styles.inputLabel}>
                Custom Amount
              </label>
              <input
                id="custom-amount"
                type="text"
                value={customAmount ? `₦${Number(customAmount).toLocaleString()}` : ""}
                onChange={handleCustomAmountChange}
                placeholder="Enter amount of choice"
                className={styles.textInput}
              />
            </div>

            {/* Step 4: Select a Cause (64px high) */}
            <div className={styles.formGroup}>
              <label htmlFor="donation-cause" className={styles.inputLabel}>
                Select a Cause
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="donation-cause"
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  className={styles.selectInput}
                >
                  {CAUSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className={styles.selectChevron} />
              </div>
            </div>
          </div>

          {/* ── Right Column: Information Form Card ─────── */}
          <div className={styles.rightCard}>
            {/* Header for Right Column */}
            <div className={styles.header}>
              <span className={styles.accentBar} aria-hidden="true" />
              <div>
                <h3 className={styles.title}>Donation Information</h3>
                <p className={styles.subtitle}>Enter your details for receipt and verification.</p>
              </div>
            </div>

            <div className={styles.infoFieldsWrap}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label htmlFor="donor-fullname" className={styles.inputLabel}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="donor-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Donald Lawrence"
                  className={styles.textInput}
                  required
                />
              </div>

              {/* Email Address */}
              <div className={styles.formGroup}>
                <label htmlFor="donor-email" className={styles.inputLabel}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="donor-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. donaldlawrence9@gmail.com"
                  className={styles.textInput}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className={styles.formGroup}>
                <label htmlFor="donor-phone" className={styles.inputLabel}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className={styles.phoneInputWrapper} ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen((prev) => !prev)}
                    className={styles.flagPickerBtn}
                    aria-label="Select Country"
                  >
                    <span className="text-base">{selectedCountry.flag}</span>
                    <span className={styles.dialCode}>{selectedCountry.dial}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#868C98]" />
                  </button>

                  <input
                    id="donor-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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

              {/* Submit CTA Button */}
              <button type="submit" className={styles.submitBtn}>
                Donate ₦{amount ? amount.toLocaleString() : "0"}
              </button>

              {/* Security Guarantee Note */}
              <div className={styles.securityNote}>
                <ShieldCheck className="w-4 h-4 text-[#868C98]" />
                <span>Your donation is secured and encrypted.</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default DonationForm;
