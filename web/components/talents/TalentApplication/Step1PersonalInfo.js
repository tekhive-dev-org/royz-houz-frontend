import { useRef } from "react";
import Image from "next/image";
import { User, Lock, Calendar, ChevronRight } from "lucide-react";
import { NIGERIAN_STATES } from "@/constants/talentApplication";
import { CustomDropdown } from "./CustomDropdown";
import styles from "./TalentApplication.module.css";

/**
 * Step 1: Personal Information Form (Image 1)
 */
export function Step1PersonalInfo({
  formData,
  updateFormData,
  onNext,
  errors = {},
}) {
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      updateFormData({
        profilePhoto: file,
        profilePhotoPreview: previewUrl,
      });
    }
  };

  return (
    <div className={styles.stepContentWrapper}>
      {/* Step Header */}
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Personal Information</h2>
        <p className={styles.stepSubtitle}>Tell us about yourself.</p>
      </div>

      {/* Form Fields */}
      <div className={styles.formGrid}>
        {/* Full Name */}
        <div className={styles.formField}>
          <label htmlFor="fullName" className={styles.inputLabel}>
            Full Name <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="John"
            value={formData.fullName || ""}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            className={`${styles.textInput} ${errors.fullName ? styles.inputError : ""}`}
            required
          />
          {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
        </div>

        {/* Professional / Stage Name */}
        <div className={styles.formField}>
          <label htmlFor="stageName" className={styles.inputLabel}>
            Professional / Stage Name (Optional)
          </label>
          <input
            id="stageName"
            type="text"
            placeholder="Tee-bay"
            value={formData.stageName || ""}
            onChange={(e) => updateFormData({ stageName: e.target.value })}
            className={styles.textInput}
          />
        </div>

        {/* Phone Number */}
        <div className={styles.formField}>
          <label htmlFor="phoneNumber" className={styles.inputLabel}>
            Phone Number <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            placeholder="080 - 764 - 6741"
            value={formData.phoneNumber || ""}
            onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
            className={`${styles.textInput} ${errors.phoneNumber ? styles.inputError : ""}`}
            required
          />
          {errors.phoneNumber && <span className={styles.errorMessage}>{errors.phoneNumber}</span>}
        </div>

        {/* Date of Birth */}
        <div className={styles.formField}>
          <label htmlFor="dateOfBirth" className={styles.inputLabel}>
            Date of Birth <span className={styles.requiredStar}>*</span>
          </label>
          <div className={styles.inputWithIconWrapper}>
            <input
              id="dateOfBirth"
              type="text"
              placeholder="dd/mm/yy"
              value={formData.dateOfBirth || ""}
              onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
              className={`${styles.textInput} ${styles.inputWithIcon} ${
                errors.dateOfBirth ? styles.inputError : ""
              }`}
              required
            />
            <Calendar className={styles.fieldRightIcon} />
          </div>
          {errors.dateOfBirth && <span className={styles.errorMessage}>{errors.dateOfBirth}</span>}
        </div>

        {/* Email Address */}
        <div className={styles.formField}>
          <label htmlFor="emailAddress" className={styles.inputLabel}>
            Email Address <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="emailAddress"
            type="email"
            placeholder="Johndoe@example.com"
            value={formData.emailAddress || ""}
            onChange={(e) => updateFormData({ emailAddress: e.target.value })}
            className={`${styles.textInput} ${errors.emailAddress ? styles.inputError : ""}`}
            required
          />
          {errors.emailAddress && <span className={styles.errorMessage}>{errors.emailAddress}</span>}
        </div>

        {/* State / Region */}
        <CustomDropdown
          label="State/region"
          options={NIGERIAN_STATES}
          value={formData.stateRegion || "Enugu"}
          onChange={(val) => updateFormData({ stateRegion: val })}
          required
          error={errors.stateRegion}
        />

        {/* Profile Photo */}
        <div className={styles.formFieldFull}>
          <label className={styles.inputLabel}>
            Profile Photo<span className={styles.requiredStar}>*</span>
          </label>

          <div className={styles.photoUploadRow}>
            {/* Left Upload Card */}
            <div
              className={styles.uploadCard}
              onClick={() => fileInputRef.current?.click()}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {formData.profilePhotoPreview ? (
                <div className={styles.uploadedAvatarWrapper}>
                  <Image
                    src={formData.profilePhotoPreview}
                    alt="Uploaded profile photo"
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className={styles.uploadIconCircle}>
                  <User className="w-5 h-5 text-[#525866]" />
                </div>
              )}

              <div className={styles.uploadTextGroup}>
                <span className={styles.uploadTitle}>
                  {formData.profilePhotoPreview ? "Change photo" : "Upload your photo"}
                </span>
                <span className={styles.uploadSubtitle}>JPG, PNG Max 5MB</span>
              </div>
            </div>

            {/* Right Hint Card */}
            <div className={styles.photoHintCard}>
              <div className={styles.lockIconCircle}>
                <Lock className="w-4 h-4 text-[#B46A2C]" />
              </div>
              <p className={styles.photoHintText}>
                Use a clear front facing photo for better recognition.
              </p>
            </div>
          </div>
          {errors.profilePhoto && (
            <span className={styles.errorMessage}>{errors.profilePhoto}</span>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.formNavRow}>
        <button
          type="button"
          disabled
          className={styles.backBtnDisabled}
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

export default Step1PersonalInfo;
