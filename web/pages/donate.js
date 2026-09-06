import { useState } from "react";
import Head from "next/head";
import {
  DonateHero,
  DonationForm,
  DonationReview,
  PaymentSuccess,
} from "@/components/donate";
import { listDonationCampaigns } from "@/services/content/donationCampaignService";
import { getDonationPageSettings } from "@/services/content/donationPageService";

/**
 * Donate page assembles the public donation-request flow:
 * 1. 'form'    -> Split Hero + 2-Column Donation & Information Form
 * 2. 'review'  -> 2-Column Review (Summary + Donor Details with Edit)
 * 3. 'success' -> Pending request confirmation; payment is not processed here.
 */
export default function DonatePage({ campaigns = null, pageSettings = null }) {
  const [step, setStep] = useState("form"); // 'form' | 'review' | 'success' | 'failure'

  const defaultCause = campaigns?.[0]?.title || "Career skill development";
  const defaultSlug = campaigns?.[0]?.slug || "career-skill-development";
  const defaultAmount = pageSettings?.giving?.defaultAmount || 25000;

  const [donationData, setDonationData] = useState({
    frequency: pageSettings?.giving?.frequencies?.[0]?.id || "one-time",
    amount: defaultAmount,
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
        currency: pageSettings?.giving?.currency || "NGN",
        frequency: donationData.frequency,
      }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      throw new Error(
        payload?.error?.message || "We could not record your donation request. Please try again."
      );
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

  const seoTitle =
    pageSettings?.seo?.title || "Donate & Empower African Creatives — Royz House";
  const seoDescription =
    pageSettings?.seo?.description ||
    "Together we can create opportunities and change lives. Support young African creatives and talents through Royz House foundation.";
  const seoOgImage = pageSettings?.seo?.ogImage || "/assets/img/donate-hero.jpg";

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoOgImage} />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen bg-[#FBFBFC]">
        {step === "form" && (
          <>
            {/* Hero Section (Controlled by Donation Page Studio) */}
            <DonateHero hero={pageSettings?.hero} />

            {/* Donation & Information Form */}
            <DonationForm
              initialData={donationData}
              campaigns={campaigns}
              giving={pageSettings?.giving}
              onProceedToReview={handleProceedToReview}
            />
          </>
        )}

        {step === "review" && (
          <DonationReview
            donationData={donationData}
            review={pageSettings?.review}
            onBack={handleBackToForm}
            onUpdateData={handleUpdateData}
            onRecordDonation={handleRecordDonationRequest}
          />
        )}

        {step === "success" && (
          <PaymentSuccess
            donationData={donationData}
            confirmation={pageSettings?.confirmation}
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
    const [campaignsRes, pageSettingsRes] = await Promise.allSettled([
      listDonationCampaigns(),
      getDonationPageSettings(),
    ]);

    const campaigns =
      campaignsRes.status === "fulfilled" &&
      campaignsRes.value?.success &&
      campaignsRes.value.data.length > 0
        ? campaignsRes.value.data
        : null;

    const pageSettings =
      pageSettingsRes.status === "fulfilled" && pageSettingsRes.value?.success
        ? pageSettingsRes.value.data
        : null;

    return {
      props: { campaigns, pageSettings },
      revalidate: 60,
    };
  } catch {
    return {
      props: { campaigns: null, pageSettings: null },
      revalidate: 60,
    };
  }
}
