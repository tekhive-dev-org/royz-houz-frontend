import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
import { INITIAL_BOOKING_DATA } from "@/constants/talentBooking";
import { createBookingSubmissionKey, submitBookingRequestRequest } from "@/services/bookingApi";
import { BookingProgressBar } from "./BookingProgressBar";
import { BookingTalentCard } from "./BookingTalentCard";
import { Step1YourDetails } from "./Step1YourDetails";
import { Step2EventInfo } from "./Step2EventInfo";
import { Step3Review } from "./Step3Review";
import { Step4Confirmed } from "./Step4Confirmed";
import { isTalentAvailableForBooking } from "../TalentProfile/talentProfileData";
import styles from "./TalentBooking.module.css";

/**
 * TalentBooking Orchestrator Component managing 4-step booking workflow
 */
export function TalentBooking({ talent }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_BOOKING_DATA,
    submissionKey: createBookingSubmissionKey(),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const talentName = talent?.name || "Talent";
  const isBookingAvailable = isTalentAvailableForBooking(talent);

  useEffect(() => {
    if (!talent || isBookingAvailable) return;

    const talentIdentifier = talent.slug || talent.id;
    router.replace(talentIdentifier ? `/talents/${talentIdentifier}` : "/talents");
  }, [isBookingAvailable, router, talent]);

  if (talent && !isBookingAvailable) return null;

  const updateFormData = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (talent?.slug || talent?.id) {
      router.push(`/talents/${talent.slug || talent.id}`);
    } else {
      router.push("/talents");
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError("");
    try {
      const result = await submitBookingRequestRequest({
        submissionKey: formData.submissionKey,
        talentId: talent.id,
        talentSlug: talent.slug,
        talentName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation,
        eventDescription: formData.eventDescription,
        budget: formData.budget || null,
        agreedToTerms: formData.agreedToTerms,
      });

      if (!result?.reference) throw new Error("The booking reference could not be created.");
      updateFormData({ bookingReference: result.reference });
      setCurrentStep(4);
    } catch (error) {
      setSubmissionError(error.message || "Unable to submit your booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.bookingPageContainer}>
      {/* Top Navigation Header: < Back | Book [Talent Name] */}
      <div className={styles.bookingNavHeader}>
        <button
          type="button"
          onClick={handleBack}
          className={styles.backButton}
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className={styles.bookingPageTitle}>Book {talentName}</h1>
      </div>

      {/* Main Booking Card Container */}
      <div className={styles.bookingCardWrapper}>
        {/* 4-Step Progress Indicator */}
        <BookingProgressBar
          currentStep={currentStep}
          onStepClick={(stepId) => setCurrentStep(stepId)}
        />

        {/* Talent Mini Card (Shown on steps 1, 2, 3) */}
        {currentStep < 4 && (
          <BookingTalentCard talent={talent} currentStep={currentStep} />
        )}

        {/* Step Views */}
        {currentStep === 1 && (
          <Step1YourDetails
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2EventInfo
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        )}

        {currentStep === 3 && (
          <Step3Review
            formData={formData}
            updateFormData={updateFormData}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
            submitError={submissionError}
          />
        )}

        {currentStep === 4 && (
          <Step4Confirmed talent={talent} formData={formData} />
        )}
      </div>
    </div>
  );
}

export default TalentBooking;
