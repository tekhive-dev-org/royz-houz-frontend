import { useState } from "react";
import Head from "next/head";
import {
  DonateHero,
  DonationForm,
  DonationReview,
  PaymentSuccess,
} from "@/components/donate";
import { listDonationCampaigns } from "@/services/content/donationCampaignService";

/**
 * Donate page assembles the public donation-request flow:
 * 1. 'form'    -> Split Hero + 2-Column Donation & Information Form
 * 2. 'review'  -> 2-Column Review (Summary + Donor Details with Edit)
 * 3. 'success' -> Pending request confirmation; payment is not processed here.
 */
export default function DonatePage({ campaigns = null }) {
  const [step, setStep] = useState("form"); // 'form' | 'review' | 'success' | 'failure'

  const defaultCause = campaigns?.[0]?.title || "Career skill development";
  const defaultSlug = campaigns?.[0]?.slug || "career-skill-development";

  const [donationData, setDonationData] = useState({
    frequency: "one-time",
    amount: 25000,
    customAmount: "",
    cause: defaultCause,
    campaignSlug: defaultSlug,
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

  const handleRecordDonationRequest = async () => {
    const response = await fetch("/api/donations/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignSlug: donationData.campaignSlug || defaultSlug,
        donorName: donationData.fullName.trim(),
        donorEmail: donationData.email.trim(),
        donorPhone: donationData.phone.trim() || null,
        amount: donationData.amount,
        currency: "NGN",
        frequency: donationData.frequency,
      }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error?.message || "We could not record your donation request. Please try again.");
    }

    setDonationData((previous) => ({ ...previous, recordId: payload.data?.id || null }));
    setStep("success");
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
              campaigns={campaigns}
              onProceedToReview={handleProceedToReview}
            />
          </>
        )}

        {step === "review" && (
          <DonationReview
            donationData={donationData}
            onBack={handleBackToForm}
            onUpdateData={handleUpdateData}
            onRecordDonation={handleRecordDonationRequest}
          />
        )}

        {step === "success" && (
          <PaymentSuccess
            donationData={donationData}
            onDonateAgain={handleBackToForm}
            onGoHome={handleBackToForm}
          />
        )}

      </main>
    </>
  );
}

export async function getStaticProps() {
  try {
    const result = await listDonationCampaigns();
    const campaigns = result.success && result.data.length > 0 ? result.data : null;
    return {
      props: { campaigns },
      revalidate: 60,
    };
  } catch {
    return {
      props: { campaigns: null },
      revalidate: 60,
    };
  }
}
