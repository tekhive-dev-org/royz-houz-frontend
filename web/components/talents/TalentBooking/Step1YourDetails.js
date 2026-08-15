import { useState } from "react";
import styles from "./TalentBooking.module.css";

/**
 * Step 1: Your Details Form with inline validation errors
 */
export function Step1YourDetails({ formData, updateFormData, onNext }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "Required";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Valid email required";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e?.preventDefault();
    setTouched(true);

    if (validate()) {
      onNext();
    }
  };

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
    if (touched) {
      // Re-validate field on the fly if already submitted once
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  return (
    <form onSubmit={handleContinue} noValidate>
      <h2 className={styles.sectionTitle}>Your Details</h2>

      <div className={styles.formGrid}>
        {/* Name Row: First Name & Last Name */}
        <div className={styles.nameRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.fieldLabel}>
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter first name"
              value={formData.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={`${styles.inputField} ${
                errors.firstName ? styles.inputError : ""
              }`}
            />
            {errors.firstName && (
              <span className={styles.errorMessage}>{errors.firstName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.fieldLabel}>
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter last name"
              value={formData.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className={`${styles.inputField} ${
                errors.lastName ? styles.inputError : ""
              }`}
            />
            {errors.lastName && (
              <span className={styles.errorMessage}>{errors.lastName}</span>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.fieldLabel}>
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter Email address"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`${styles.inputField} ${
              errors.email ? styles.inputError : ""
            }`}
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
          )}
        </div>

        {/* Phone Number */}
        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.fieldLabel}>
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={`${styles.inputField} ${
              errors.phone ? styles.inputError : ""
            }`}
          />
          {errors.phone && (
            <span className={styles.errorMessage}>{errors.phone}</span>
          )}
        </div>

        {/* Submit Action */}
        <button type="submit" className={styles.continueButton}>
          Continue
        </button>
      </div>
    </form>
  );
}

export default Step1YourDetails;
