import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { INITIAL_FORM_DATA } from "@/constants/talentApplication";
import { ApplicationProgressBar } from "./ApplicationProgressBar";
import { Step1PersonalInfo } from "./Step1PersonalInfo";
import { Step2TalentExperience } from "./Step2TalentExperience";
import { Step3PortfolioSocials } from "./Step3PortfolioSocials";
import { Step4AvailabilityBooking } from "./Step4AvailabilityBooking";
import { Step5ReviewSubmit } from "./Step5ReviewSubmit";
import { ApplicationSuccessModal } from "./ApplicationSuccessModal";
import styles from "./TalentApplication.module.css";

/**
 * TalentApplication container orchestrating the 5-step application wizard.
 */
export function TalentApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    // Clear errors for modified fields
    const updatedKeys = Object.keys(fields);
    if (updatedKeys.some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        updatedKeys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};

    if (step === 1) {
      if (!formData.fullName?.trim()) stepErrors.fullName = "Full name is required.";
      if (!formData.phoneNumber?.trim()) stepErrors.phoneNumber = "Phone number is required.";
      if (!formData.dateOfBirth?.trim()) stepErrors.dateOfBirth = "Date of birth is required.";
      if (!formData.emailAddress?.trim() || !formData.emailAddress.includes("@")) {
        stepErrors.emailAddress = "Please enter a valid email address.";
      }
    }

    if (step === 2) {
      if (!formData.talentCategory) stepErrors.talentCategory = "Please select your talent category.";
      if (
        (formData.talentCategory === "Custom" || formData.talentCategory === "custom") &&
        !formData.customTalentCategory?.trim()
      ) {
        stepErrors.customTalentCategory = "Please specify your custom talent category.";
      }
      if (!formData.shortBio?.trim()) stepErrors.shortBio = "Short bio is required.";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate server submission delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const genRef = `RH-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    setReferenceId(genRef);
    setIsSubmitting(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.innerContainer}>
        {/* Top Back Navigation */}
        <div className={styles.topBackRow}>
          <Link href="/talents" className={styles.topBackLink}>
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        {/* Form Card Container */}
        <div className={styles.formCard}>
          {/* Top 5-Step Visual Progress Bar */}
          <ApplicationProgressBar
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          {/* Render Active Step */}
          {currentStep === 1 && (
            <Step1PersonalInfo
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <Step2TalentExperience
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <Step3PortfolioSocials
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <Step4AvailabilityBooking
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <Step5ReviewSubmit
              formData={formData}
              updateFormData={updateFormData}
              onSubmit={handleSubmit}
              onBack={handleBack}
              onEditStep={(stepId) => setCurrentStep(stepId)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Submission Success Confirmation Modal */}
      <ApplicationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        referenceId={referenceId}
        applicantName={formData.stageName || formData.fullName || "Creative Artist"}
      />
    </div>
  );
}

export default TalentApplication;
