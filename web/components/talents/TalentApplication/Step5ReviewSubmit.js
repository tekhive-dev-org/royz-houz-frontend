import { useState } from "react";
import {
  User,
  Star,
  Link as LinkIcon,
  Calendar,
  FileText,
  Edit2,
  Music,
  Video,
  ChevronRight,
} from "lucide-react";
import styles from "./TalentApplication.module.css";

/**
 * Step 5: Review & Submit Summary Form (Image 5)
 */
export function Step5ReviewSubmit({
  formData,
  updateFormData,
  onSubmit,
  onBack,
  onEditStep,
  isSubmitting = false,
}) {
  const [hasConfirmed, setHasConfirmed] = useState(Boolean(formData.confirmedAccuracy));
  const [consentError, setConsentError] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!hasConfirmed) {
      setConsentError("Please confirm that all information provided is accurate.");
      return;
    }
    setConsentError("");
    updateFormData({ confirmedAccuracy: true });
    onSubmit();
  };

  const opportunitiesLabels = {
    events: "Events",
    performances: "Performances",
    media_features: "Media Features",
    brand_collabs: "Brand Collaborations",
    speaking_workshops: "Speaking/ Workshops",
    commercial_projects: "Commercial Projects",
    creative_collabs: "Creative Collaborations",
    other_opps: "Other Opportunities",
  };

  return (
    <div className={styles.stepContentWrapper}>
      {/* Step Header */}
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Review &amp; Submit</h2>
        <p className={styles.stepSubtitle}>
          Please review your information below before submitting your application.
        </p>
      </div>

      <div className={styles.reviewCardsGrid}>
        {/* 1. Personal Information Card */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <div className={styles.reviewCardTitleGroup}>
              <div className={styles.reviewIconCircle}>
                <User className="w-4 h-4 text-[#B46A2C]" />
              </div>
              <h3 className={styles.reviewCardTitle}>Personal Information</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className={styles.editBtn}
              aria-label="Edit Personal Information"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className={styles.reviewFieldsGrid}>
            <div>
              <span className={styles.reviewLabel}>Full Name</span>
              <p className={styles.reviewValue}>{formData.fullName || "—"}</p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Location</span>
              <p className={styles.reviewValue}>
                {formData.stateRegion ? `${formData.stateRegion}, Nigeria` : "—"}
              </p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Email Address</span>
              <p className={styles.reviewValue}>{formData.emailAddress || "—"}</p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Date of Birth</span>
              <p className={styles.reviewValue}>{formData.dateOfBirth || "—"}</p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Phone Number</span>
              <p className={styles.reviewValue}>{formData.phoneNumber || "—"}</p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Profession / Stage Name</span>
              <p className={styles.reviewValue}>
                {formData.stageName
                  ? `${formData.talentCategory || "Artist"} / ${formData.stageName}`
                  : formData.talentCategory || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Talent & Experience Card */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <div className={styles.reviewCardTitleGroup}>
              <div className={styles.reviewIconCircle}>
                <Star className="w-4 h-4 text-[#B46A2C]" />
              </div>
              <h3 className={styles.reviewCardTitle}>Talent &amp; Experience</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className={styles.editBtn}
              aria-label="Edit Talent and Experience"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className={styles.reviewFieldsGrid}>
            <div>
              <span className={styles.reviewLabel}>Primary Talent</span>
              <p className={styles.reviewValue}>
                {formData.talentCategory === "Custom"
                  ? formData.customTalentCategory
                  : formData.talentCategory || "—"}
              </p>
            </div>
            <div className={styles.reviewBioCol}>
              <span className={styles.reviewLabel}>Bio</span>
              <p className={styles.reviewBioText}>{formData.shortBio || "—"}</p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Years of experience</span>
              <p className={styles.reviewValue}>{formData.yearsOfExperience || "—"}</p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Experience Level</span>
              <p className={styles.reviewValue}>{formData.experienceLevel || "—"}</p>
            </div>
          </div>
        </div>

        {/* 3. Portfolio & Socials Card */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <div className={styles.reviewCardTitleGroup}>
              <div className={styles.reviewIconCircle}>
                <LinkIcon className="w-4 h-4 text-[#B46A2C]" />
              </div>
              <h3 className={styles.reviewCardTitle}>Portfolio &amp; Socials</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className={styles.editBtn}
              aria-label="Edit Portfolio and Socials"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className={styles.reviewSectionBlock}>
            <span className={styles.reviewLabel}>Portfolio / Website</span>
            <p className={styles.reviewValue}>
              {formData.otherPlatformUrl || "https://www.royzhouz.com/talents"}
            </p>
          </div>

          {/* Social Media Links */}
          <div className={styles.reviewSectionBlock}>
            <span className={styles.reviewLabel}>Social Media</span>
            <div className={styles.socialChipsRow}>
              {(formData.socialProfiles || []).map((sp) => (
                <span key={sp.id} className={styles.socialChip}>
                  <span className={styles.socialPlatformName}>{sp.platform}:</span>{" "}
                  {sp.url.replace(/^https?:\/\//, "")}
                </span>
              ))}
            </div>
          </div>

          {/* Work Samples */}
          <div className={styles.reviewSectionBlock}>
            <span className={styles.reviewLabel}>Work Samples</span>
            <div className={styles.workSamplePillsRow}>
              {(formData.workSamples || []).map((sample) => (
                <div key={sample.id} className={styles.workSamplePill}>
                  {sample.type === "audio" && <Music className="w-3.5 h-3.5 text-[#B46A2C]" />}
                  {sample.type === "video" && <Video className="w-3.5 h-3.5 text-[#B46A2C]" />}
                  {sample.type === "pdf" && <FileText className="w-3.5 h-3.5 text-red-500" />}
                  {sample.type === "image" && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                  <span className="truncate max-w-[150px]">{sample.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Availability & Booking Card */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            <div className={styles.reviewCardTitleGroup}>
              <div className={styles.reviewIconCircle}>
                <Calendar className="w-4 h-4 text-[#B46A2C]" />
              </div>
              <h3 className={styles.reviewCardTitle}>Availability &amp; Booking</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className={styles.editBtn}
              aria-label="Edit Availability and Booking"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className={styles.reviewSectionBlock}>
            <span className={styles.reviewLabel}>Interested in Bookings</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className={styles.reviewValue}>
                {formData.interestedInBookings === "yes"
                  ? "Yes, I'm interested in bookings"
                  : "No, joining for exposure/networking"}
              </p>
            </div>
          </div>

          {/* Opportunities Tags */}
          <div className={styles.reviewSectionBlock}>
            <span className={styles.reviewLabel}>Opportunities interested in</span>
            <div className={styles.oppsPillsRow}>
              {(formData.opportunities || []).map((oppId) => (
                <span key={oppId} className={styles.oppPill}>
                  {opportunitiesLabels[oppId] || oppId}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.reviewFieldsGrid}>
            <div>
              <span className={styles.reviewLabel}>Availability</span>
              <p className={styles.reviewValue}>
                {formData.generalAvailability === "both"
                  ? "Both weekends & weekdays"
                  : formData.generalAvailability === "weekdays"
                  ? "Weekdays"
                  : formData.generalAvailability === "weekends"
                  ? "Weekends"
                  : "Flexible / Varies"}
              </p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Preferred engagement type</span>
              <p className={styles.reviewValue}>
                {formData.preferredEngagement === "in_person"
                  ? "In-person"
                  : formData.preferredEngagement === "remote"
                  ? "Remote"
                  : "Both (In-person & Remote)"}
              </p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Where you&apos;re available</span>
              <p className={styles.reviewValue}>
                {formData.workLocations?.includes("nigeria")
                  ? "Anywhere in Nigeria"
                  : formData.workLocations?.includes("international")
                  ? "Internationally"
                  : "Local area only"}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Additional Information Card */}
        <div className={styles.reviewCardFull}>
          <div className={styles.reviewCardHeader}>
            <div className={styles.reviewCardTitleGroup}>
              <div className={styles.reviewIconCircle}>
                <FileText className="w-4 h-4 text-[#B46A2C]" />
              </div>
              <h3 className={styles.reviewCardTitle}>Additional Information</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className={styles.editBtn}
              aria-label="Edit Additional Information"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className={styles.reviewFieldsGrid}>
            <div>
              <span className={styles.reviewLabel}>Languages</span>
              <p className={styles.reviewValue}>{formData.languages || "English, Hausa, Yoruba"}</p>
            </div>
            <div>
              <span className={styles.reviewLabel}>Achievements</span>
              <ul className={styles.achievementsList}>
                {(formData.achievements || []).map((ach, idx) => (
                  <li key={idx}>• {ach}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className={styles.reviewLabel}>Equipment / Resources</span>
              <p className={styles.reviewValue}>
                {formData.equipmentResources || "Home Studio, Recording Equipments, Microphone"}
              </p>
            </div>
            <div>
              <span className={styles.reviewLabel}>References (Optional)</span>
              <p className={styles.reviewValue}>{formData.references || "Available upon request"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Consent Checkbox */}
      <div className={styles.consentContainer}>
        <label className={styles.consentCheckboxLabel}>
          <input
            type="checkbox"
            checked={hasConfirmed}
            onChange={(e) => {
              setHasConfirmed(e.target.checked);
              if (e.target.checked) setConsentError("");
            }}
            className={styles.consentCheckbox}
          />
          <span>I confirm that all information provided is accurate and complete</span>
        </label>
        {consentError && <span className={styles.errorMessage}>{consentError}</span>}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.formNavRow}>
        <button type="button" onClick={onBack} className={styles.backBtn}>
          &lt; Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          <span>{isSubmitting ? "Submitting..." : "Submit Application"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Step5ReviewSubmit;
