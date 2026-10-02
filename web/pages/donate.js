import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
 * Donate page assembles the public donation flow:
 * 1. 'form'    -> Split Hero + 2-Column Donation & Information Form
 * 2. 'review'  -> 2-Column Review with Paystack secure checkout trigger
 * 3. 'success' -> Verified Paystack donation receipt confirmation
 */
export default function DonatePage({ campaigns: initialCampaigns = null, pageSettings = null }) {
  const router = useRouter();
  const [step, setStep] = useState("form"); // 'form' | 'review' | 'success' | 'failure'
  const [campaigns, setCampaigns] = useState(initialCampaigns);

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
    recordId: null,
    status: "pending",
  });

  // Client-side fetch to ensure live raised amounts and progress are always up-to-date
  useEffect(() => {
    let isMounted = true;
    fetch("/api/donations/campaigns")
      .then((res) => res.json())
      .then((payload) => {
        if (isMounted && payload?.success && Array.isArray(payload.data) && payload.data.length > 0) {
          setCampaigns(payload.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Verify and display confirmed donation receipt if returning with a reference query
  useEffect(() => {
    if (!router.isReady) return;
    const ref =
      typeof router.query.reference === "string"
        ? router.query.reference
        : typeof router.query.trxref === "string"
        ? router.query.trxref
        : "";

    if (ref && ref.startsWith("RH-DON")) {
      fetch("/api/donations/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      })
        .then(async (response) => {
          const payload = await response.json().catch(() => null);
          if (response.ok && payload?.success && payload.data) {
            setDonationData((prev) => ({
              ...prev,
              amount: payload.data.amount || prev.amount,
              frequency: payload.data.frequency || prev.frequency,
              cause: payload.data.campaignTitle || prev.cause,
              campaignSlug: payload.data.campaignSlug || prev.campaignSlug,
              fullName: payload.data.donorName || prev.fullName,
              email: payload.data.donorEmail || prev.email,
              phone: payload.data.donorPhone || prev.phone,
              recordId: payload.data.reference,
              status: "approved",
            }));
            setStep("success");

            // Refresh campaigns so new donation immediately shows in progress bar
            fetch("/api/donations/campaigns")
              .then((res) => res.json())
              .then((cPayload) => {
                if (cPayload?.success && Array.isArray(cPayload.data) && cPayload.data.length > 0) {
                  setCampaigns(cPayload.data);
                }
              })
              .catch(() => {});

            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }
        })
        .catch(() => {});
    }
  }, [router.isReady, router.query.reference, router.query.trxref]);

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
    const response = await fetch("/api/donations/payment/initialize", {
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
        payload?.error?.message || "Unable to start Paystack checkout. Please try again."
      );
    }

    if (payload.data?.authorizationUrl) {
      if (typeof window !== "undefined") {
        window.location.href = payload.data.authorizationUrl;
      }
      return;
    }

    throw new Error("Unable to connect to Paystack payment gateway.");
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
