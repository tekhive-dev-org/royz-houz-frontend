import { ChevronRight } from "lucide-react";
import {
  TALENT_CATEGORIES,
  EXPERIENCE_LEVELS,
  YEARS_OF_EXPERIENCE,
} from "@/constants/talentApplication";
import { CustomDropdown } from "./CustomDropdown";
import styles from "./TalentApplication.module.css";

/**
 * Step 2: Talent & Experience Form (Image 2 + Dropdowns Images 3, 4, 5)
 */
export function Step2TalentExperience({
  formData,
  updateFormData,
  onNext,
  onBack,
  errors = {},
}) {
  const bioLength = formData.shortBio?.length || 0;
  const isCustomCategory = formData.talentCategory === "Custom" || formData.talentCategory === "custom";

  return (
    <div className={styles.stepContentWrapper}>
      {/* Step Header */}
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Talent &amp; Experience</h2>
        <p className={styles.stepSubtitle}>
          Share your talent, skill you are passionate about.
        </p>
      </div>

      {/* Form Fields */}
      <div className={styles.formGrid}>
        {/* 1. Talent Category Dropdown (Image 3) */}
        <CustomDropdown
          label="Talent Category"
          options={TALENT_CATEGORIES}
          value={formData.talentCategory || "Musician"}
          onChange={(val) => updateFormData({ talentCategory: val })}
          required
          error={errors.talentCategory}
        />

        {/* Custom Category Input if "Custom" is chosen */}
        {isCustomCategory && (
          <div className={styles.formField}>
            <label htmlFor="customTalentCategory" className={styles.inputLabel}>
              Specify Your Talent Category <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="customTalentCategory"
              type="text"
              placeholder="e.g. Fashion Designer, DJ, Visual Artist"
              value={formData.customTalentCategory || ""}
              onChange={(e) => updateFormData({ customTalentCategory: e.target.value })}
              className={`${styles.textInput} ${errors.customTalentCategory ? styles.inputError : ""}`}
              required
            />
          </div>
        )}

        {/* 2. Experience Level Dropdown (Image 4) */}
        <CustomDropdown
          label="Experience Level"
          options={EXPERIENCE_LEVELS}
          value={formData.experienceLevel || "Intermediate"}
          onChange={(val) => updateFormData({ experienceLevel: val })}
          required
          error={errors.experienceLevel}
        />

        {/* 3. Years of Experience Dropdown (Image 5) */}
        <CustomDropdown
          label="Years of Experience"
          options={YEARS_OF_EXPERIENCE}
          value={formData.yearsOfExperience || "1–2 years"}
          onChange={(val) => updateFormData({ yearsOfExperience: val })}
          required
          error={errors.yearsOfExperience}
        />

        {/* 4. Short Bio */}
        <div className={styles.formFieldFull}>
          <label htmlFor="shortBio" className={styles.inputLabel}>
            Short Bio<span className={styles.requiredStar}>*</span>
          </label>
          <div className={styles.textareaWrapper}>
            <textarea
              id="shortBio"
              rows={4}
              maxLength={500}
              placeholder="Tell us about yourself"
              value={formData.shortBio || ""}
              onChange={(e) => updateFormData({ shortBio: e.target.value })}
              className={`${styles.textareaInput} ${errors.shortBio ? styles.inputError : ""}`}
              required
            />
            <div className={styles.charCounter}>
              {bioLength} / 500 characters
            </div>
          </div>
          {errors.shortBio && <span className={styles.errorMessage}>{errors.shortBio}</span>}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.formNavRow}>
        <button
          type="button"
          onClick={onBack}
          className={styles.backBtn}
        >
          &lt; Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className={styles.nextBtn}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Step2TalentExperience;
