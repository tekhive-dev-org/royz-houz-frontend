import { useState } from "react";
import Head from "next/head";
import {
  DonateHero,
  DonationForm,
  DonationReview,
  PaymentSuccess,
  PaymentFailure,
} from "@/components/donate";

/**
 * Donate page assembling the 4-step professional donation flow:
 * 1. 'form'    -> Split Hero + 2-Column Donation & Information Form
 * 2. 'review'  -> 2-Column Review (Summary + Donor Details with Edit)
 * 3. 'success' -> Professional Tax-Deductible Receipt & Community Impact
 * 4. 'failure' -> Diagnostic Failure Screen with Troubleshooting & Instant Retry
 */
export default function DonatePage() {
  const [step, setStep] = useState("form"); // 'form' | 'review' | 'success' | 'failure'
  const [errorMessage, setErrorMessage] = useState("");
  const [donationData, setDonationData] = useState({
    frequency: "one-time",
    amount: 25000,
    customAmount: "",
    cause: "Career skill development",
    fullName: "Donald Lawrence",
    email: "donaldlawrence9@gmail.com",
    phone: "+234 465 126 2351",
  });

  const handleProceedToReview = (data) => {
    setDonationData((prev) => ({
      ...prev,
      ...data,
    }));
    setStep("review");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePaymentSuccess = () => {
    setStep("success");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePaymentFailure = (msg) => {
    setErrorMessage(
      msg ||
        "Your card issuer declined the transaction. This is usually due to insufficient funds, an expired card, or a 3D-Secure authentication timeout."
    );
    setStep("failure");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRetryPayment = () => {
    setStep("review");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleUpdateData = (updatedData) => {
    setDonationData(updatedData);
  };

  return (
    <>
      <Head>
        <title>Donate &amp; Empower African Creatives — Royz House</title>
        <meta
          name="description"
          content="Together we can create opportunities and change lives. Support young African creatives and talents through Royz House foundation."
        />
        <meta property="og:title" content="Donate & Empower African Creatives — Royz House" />
        <meta
          property="og:description"
          content="Your support empowers talents, creates opportunities, and builds a better future."
        />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen bg-[#FBFBFC]">
        {step === "form" && (
          <>
            {/* Hero Section */}
            <DonateHero />

            {/* Donation & Information Form */}
            <DonationForm
              initialData={donationData}
              onProceedToReview={handleProceedToReview}
            />
          </>
        )}

        {step === "review" && (
          <DonationReview
            donationData={donationData}
            onBack={handleBackToForm}
            onUpdateData={handleUpdateData}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={() => handlePaymentFailure()}
          />
        )}

        {step === "success" && (
          <PaymentSuccess
            donationData={donationData}
            onDonateAgain={handleBackToForm}
            onGoHome={handleBackToForm}
          />
        )}

        {step === "failure" && (
          <PaymentFailure
            donationData={donationData}
            errorMessage={errorMessage}
            onRetry={handleRetryPayment}
            onEditDetails={handleBackToForm}
            onGoBack={handleBackToForm}
          />
        )}
      </main>
    </>
  );
}
