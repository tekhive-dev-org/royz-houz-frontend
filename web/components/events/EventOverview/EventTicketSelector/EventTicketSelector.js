import { useState } from "react";
import { Plus, Minus, Check, ChevronDown, Lock } from "lucide-react";
import { PaymentSuccessModal, PaymentFailureModal } from "../PaymentModals";
import styles from "./EventTicketSelector.module.css";

/**
 * EventTicketSelector component handling 3-step checkout flow (Select Ticket, Your Details, Review & Pay).
 * Note: Payment details (card inputs) are omitted in favor of Paystack payment gateway.
 */
export function EventTicketSelector({
  event,
  selectedTierId: controlledTierId,
  onSelectTier,
  onProceed,
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Select, 2: Details, 3: Review

  // Ticket tier & quantity state
  const tiers = event?.ticketTiers || [];
  const defaultTier = tiers.find((t) => t.isDefault) || tiers[1] || tiers[0];
  const [internalTierId, setInternalTierId] = useState(defaultTier?.id || "standard");
  const selectedTierId = controlledTierId !== undefined ? controlledTierId : internalTierId;
  const [quantity, setQuantity] = useState(1);

  const selectedTier = tiers.find((t) => t.id === selectedTierId) || defaultTier;

  // Form State for Step 2
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    dietary: "No special requirements",
    subscribeNews: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  const handleIncrement = () => setQuantity((prev) => Math.min(prev + 1, 10));
  const handleDecrement = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const handleSelectTier = (tierId) => {
    if (onSelectTier) {
      onSelectTier(tierId);
    } else {
      setInternalTierId(tierId);
    }
  };

  const ticketSubtotal = (selectedTier?.price || 0) * quantity;
  const serviceFee = selectedTier?.price ? Math.round(ticketSubtotal * 0.08 > 1000 ? 1000 : ticketSubtotal * 0.08) : 1000;
  const grandTotal = ticketSubtotal + serviceFee;

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) errors.phone = "Phone number is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToDetails = () => {
    setCurrentStep(2);
  };

  const handleContinueToReview = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePay = () => {
    if (!agreeTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setIsProcessing(true);

    const orderPayload = {
      reference: "RH-" + Math.floor(100000 + Math.random() * 900000),
      tier: selectedTier,
      quantity,
      formData,
      ticketSubtotal,
      serviceFee,
      grandTotal,
      eventTitle: event?.title || "Fashion Forward: Abuja",
    };

    if (onProceed) {
      onProceed(orderPayload);
      setIsProcessing(false);
    } else {
      // Simulate Paystack popup / flow completion
      setTimeout(() => {
        setIsProcessing(false);
        setOrderReceipt(orderPayload);
        setShowSuccessModal(true);
      }, 1000);
    }
  };

  return (
    <div className={styles.container}>
      {/* 3-Step Checkout Indicator */}
      <div className={styles.stepperContainer} aria-label="Checkout Steps">
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`${styles.stepItem} ${
            currentStep >= 1 ? styles.stepItemActive : ""
          }`}
        >
          <span
            className={
              currentStep >= 1
                ? styles.stepNumberActive
                : styles.stepNumber
            }
          >
            1
          </span>
          <span
            className={
              currentStep >= 1
                ? styles.stepLabelActive
                : styles.stepLabel
            }
          >
            Select Ticket
          </span>
        </button>

        <div
          className={`${styles.stepConnector} ${
            currentStep >= 2 ? styles.stepConnectorActive : ""
          }`}
          aria-hidden="true"
        />

        {/* Step 2 */}
        <button
          type="button"
          onClick={() => {
            if (currentStep > 2 || validateStep2()) setCurrentStep(2);
          }}
          className={`${styles.stepItem} ${
            currentStep >= 2 ? styles.stepItemActive : ""
          }`}
        >
          <span
            className={
              currentStep >= 2
                ? styles.stepNumberActive
                : styles.stepNumber
            }
          >
            2
          </span>
          <span
            className={
              currentStep >= 2
                ? styles.stepLabelActive
                : styles.stepLabel
            }
          >
            Your Details
          </span>
        </button>

        <div
          className={`${styles.stepConnector} ${
            currentStep >= 3 ? styles.stepConnectorActive : ""
          }`}
          aria-hidden="true"
        />

        {/* Step 3 */}
        <button
          type="button"
          onClick={() => {
            if (validateStep2()) setCurrentStep(3);
          }}
          className={`${styles.stepItem} ${
            currentStep >= 3 ? styles.stepItemActive : ""
          }`}
        >
          <span
            className={
              currentStep >= 3
                ? styles.stepNumberActive
                : styles.stepNumber
            }
          >
            3
          </span>
          <span
            className={
              currentStep >= 3
                ? styles.stepLabelActive
                : styles.stepLabel
            }
          >
            Review & Pay
          </span>
        </button>
      </div>

      {/* ── STEP 1: SELECT TICKET ──────────────────────────── */}
      {currentStep === 1 && (
        <>
          <h2 className={styles.sectionHeading}>Select Your Ticket</h2>

          {/* Ticket Tiers List */}
          <div className={styles.tiersList} role="radiogroup" aria-label="Ticket options">
            {tiers.map((tier) => {
              const isSelected = tier.id === selectedTierId;

              return (
                <div
                  key={tier.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelectTier(tier.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectTier(tier.id);
                    }
                  }}
                  className={`${styles.tierCard} ${
                    isSelected ? styles.tierCardSelected : ""
                  }`}
                >
                  {/* Radio Indicator & Details */}
                  <div className={styles.tierLeft}>
                    <div
                      className={`${styles.radioCircle} ${
                        isSelected ? styles.radioCircleSelected : ""
                      }`}
                    >
                      {isSelected && <div className={styles.radioInnerDot} />}
                    </div>

                    <div className={styles.tierInfo}>
                      <div className={styles.tierTitleRow}>
                        <span className={styles.tierName}>{tier.name}</span>
                        {tier.badge && (
                          <span className={styles.tierBadge}>
                            {tier.badge}
                          </span>
                        )}
                      </div>

                      {/* Feature Checkmarks list */}
                      {tier.features && tier.features.length > 0 && (
                        <ul
                          className={`${styles.featuresList} ${
                            isSelected ? styles.featuresListSelected : ""
                          }`}
                        >
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className={styles.featureItem}>
                              <Check
                                className={`${styles.featureCheckIcon} ${
                                  isSelected
                                    ? styles.checkIconSelected
                                    : styles.checkIconNormal
                                }`}
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className={styles.tierRight}>
                    <span className={styles.tierPrice}>{tier.priceFormatted}</span>
                    <span className={styles.tierPriceSub}>per ticket</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity Card */}
          <div className={styles.quantityCard}>
            <span className={styles.quantityLabel}>Quantity</span>

            <div className={styles.stepperControl}>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className={styles.stepperMinusBtn}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>

              <span className={styles.quantityCount}>{quantity}</span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= 10}
                className={styles.stepperPlusBtn}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Continue Action Button */}
          <button
            type="button"
            onClick={handleContinueToDetails}
            className={styles.continueBtn}
          >
            <span>CONTINUE TO DETAILS →</span>
          </button>
        </>
      )}

      {/* ── STEP 2: YOUR DETAILS ───────────────────────────── */}
      {currentStep === 2 && (
        <div className={styles.stepFormWrapper}>
          <div className={styles.headerBlock}>
            <h2 className={styles.sectionHeading}>Your Details</h2>
            <p className={styles.sectionSubtext}>
              Fill in your information to secure your ticket
            </p>
          </div>

          {/* Details Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleContinueToReview();
            }}
            className={styles.formGrid}
          >
            {/* First & Last Name */}
            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.formLabel}>
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="e.g. Bisola"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`${styles.formInput} ${
                    formErrors.firstName ? styles.formInputError : ""
                  }`}
                />
                {formErrors.firstName && (
                  <span className={styles.errorText}>{formErrors.firstName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.formLabel}>
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="e.g. Jeladine"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`${styles.formInput} ${
                    formErrors.lastName ? styles.formInputError : ""
                  }`}
                />
                {formErrors.lastName && (
                  <span className={styles.errorText}>{formErrors.lastName}</span>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="e.g. bisolajeladine994@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`${styles.formInput} ${
                  formErrors.email ? styles.formInputError : ""
                }`}
              />
              {formErrors.email && (
                <span className={styles.errorText}>{formErrors.email}</span>
              )}
            </div>

            {/* Phone Number & Organization */}
            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.formLabel}>
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 08066704632"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`${styles.formInput} ${
                    formErrors.phone ? styles.formInputError : ""
                  }`}
                />
                {formErrors.phone && (
                  <span className={styles.errorText}>{formErrors.phone}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="organization" className={styles.formLabel}>
                  Organization (optional)
                </label>
                <input
                  id="organization"
                  type="text"
                  placeholder="e.g. StyleNG"
                  value={formData.organization}
                  onChange={(e) =>
                    handleInputChange("organization", e.target.value)
                  }
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Dietary Requirements Dropdown */}
            <div className={styles.formGroup}>
              <label htmlFor="dietary" className={styles.formLabel}>
                Dietary Requirements
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="dietary"
                  value={formData.dietary}
                  onChange={(e) => handleInputChange("dietary", e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="No special requirements">
                    No special requirements
                  </option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Halal">Halal</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className={styles.selectChevron} />
              </div>
            </div>

            {/* Newsletter Checkbox */}
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={formData.subscribeNews}
                onChange={(e) =>
                  handleInputChange("subscribeNews", e.target.checked)
                }
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxLabel}>
                Keep me updated about future Royz House events and news
              </span>
            </label>

            {/* Action Buttons Row */}
            <div className={styles.dualActionsRow}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={styles.backBtn}
              >
                ← BACK
              </button>

              <button
                type="submit"
                className={styles.primaryActionBtn}
              >
                CONTINUE TO REVIEW →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── STEP 3: REVIEW & PAY (PAYSTACK READY) ───────────── */}
      {currentStep === 3 && (
        <div className={styles.stepFormWrapper}>
          <h2 className={styles.sectionHeading}>Review & Pay</h2>

          {/* 1. ORDER SUMMARY CARD */}
          <div className={styles.reviewCard}>
            <span className={styles.cardSectionTitle}>ORDER SUMMARY</span>

            <div className={styles.summaryLine}>
              <div className={styles.summaryItemLeft}>
                <span className={styles.summaryItemName}>
                  {selectedTier?.name} Ticket × {quantity}
                </span>
                <span className={styles.summaryItemSub}>
                  {event?.title || "Fashion Forward: Abuja"}
                </span>
              </div>
              <span className={styles.summaryItemPrice}>
                ₦{ticketSubtotal.toLocaleString()}
              </span>
            </div>

            <div className={styles.feeLine}>
              <span className={styles.feeLabel}>Service fee (8%)</span>
              <span className={styles.feeAmount}>
                ₦{serviceFee.toLocaleString()}
              </span>
            </div>

            <div className={styles.summaryDivider} />

            <div className={styles.totalLine}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalAmount}>
                ₦{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 2. REGISTRANT CARD */}
          <div className={styles.reviewCard}>
            <div className={styles.registrantHeader}>
              <span className={styles.cardSectionTitle}>REGISTRANT</span>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={styles.editBtn}
              >
                Edit
              </button>
            </div>

            <div className={styles.registrantInfo}>
              <span className={styles.registrantName}>
                {formData.firstName || "Bisola"} {formData.lastName || "Jeladine"}
              </span>
              <span className={styles.registrantDetails}>
                {formData.email || "bisolajeladine994@gmail.com"} ·{" "}
                {formData.phone || "08066704632"}
              </span>
            </div>
          </div>

          {/* 3. Terms & Conditions Checkbox */}
          <div className={styles.termsWrapper}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (e.target.checked) setTermsError(false);
                }}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxLabel}>
                I agree to the{" "}
                <span className={styles.linkText}>Terms & Conditions</span> and{" "}
                <span className={styles.linkText}>Refund Policy</span>
              </span>
            </label>
            {termsError && (
              <span className={styles.errorText}>
                Please agree to the Terms & Conditions to proceed
              </span>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className={styles.dualActionsRow}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={styles.backBtn}
            >
              ← BACK
            </button>

            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className={styles.primaryActionBtn}
            >
              {isProcessing ? (
                <span>CONNECTING TO PAYSTACK...</span>
              ) : (
                <span>PAY ₦{grandTotal.toLocaleString()} →</span>
              )}
            </button>
          </div>

          {/* Security SSL Notice */}
          <div className={styles.securityNotice}>
            <Lock className="w-3.5 h-3.5 text-[#525866]" />
            <span>Secured by 256-bit SSL encryption</span>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setCurrentStep(1);
        }}
        orderData={orderReceipt}
      />

      {/* Payment Failure Modal */}
      <PaymentFailureModal
        isOpen={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        onRetry={() => {
          setShowFailureModal(false);
          handlePay();
        }}
      />
    </div>
  );
}

export default EventTicketSelector;
