import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PaymentSuccessModal } from "@/components/events/EventOverview/PaymentModals";
import styles from "./callback.module.css";

export default function PaystackCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, error: "", isDonation: false, data: null });

  useEffect(() => {
    if (!router.isReady) return;
    const reference =
      typeof router.query.reference === "string"
        ? router.query.reference
        : typeof router.query.trxref === "string"
        ? router.query.trxref
        : "";

    if (!reference) {
      setState({ loading: false, error: "No payment reference was provided.", isDonation: false, data: null });
      return;
    }

    const isDonation = reference.startsWith("RH-DON");
    const verifyUrl = isDonation
      ? "/api/donations/payment/verify"
      : "/api/events/payment/verify";

    fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || !body?.success) {
          throw new Error(body?.error?.message || "Payment verification failed.");
        }
        if (isDonation) {
          router.replace(`/donate?reference=${encodeURIComponent(reference)}&status=confirmed`);
        } else {
          setState({ loading: false, error: "", isDonation: false, data: body.data });
        }
      })
      .catch((error) => setState({ loading: false, error: error.message, isDonation, data: null }));
  }, [router.isReady, router.query.reference, router.query.trxref, router]);

  const isDonation = state.isDonation || (typeof router.query.reference === "string" && router.query.reference.startsWith("RH-DON"));

  return (
    <>
      <Head>
        <title>{isDonation ? "Donation Payment | RoyzHouz" : "Ticket Payment | RoyzHouz"}</title>
      </Head>
      <main className={styles.page}>
        <section className={styles.card}>
          {state.loading ? (
            <div className={styles.loadingState} aria-live="polite">
              <div className={styles.brandLockup}>
                <span className={styles.brandBadge}>RH</span>
                <span>ROYZ HOUZ</span>
              </div>
              <div className={styles.loadingMark} aria-hidden="true">
                <span className={styles.spinner} />
              </div>
              <span className={styles.eyebrow}>SECURE PAYMENT CHECK</span>
              <h1>Confirming your {isDonation ? "donation" : "payment"}</h1>
              <p className={styles.copy}>
                We&apos;re securely verifying your Paystack transaction. Please keep this window open while we confirm your contribution.
              </p>
              <div className={styles.progressTrack} aria-hidden="true">
                <span />
              </div>
              <div className={styles.statusSteps}>
                <span className={styles.stepDone}>
                  <i />Payment submitted
                </span>
                <span className={styles.stepActive}>
                  <i />Verifying securely
                </span>
                <span>
                  <i />{isDonation ? "Receipt issued" : "Ticket issued"}
                </span>
              </div>
              <div className={styles.securityRow}>
                <ShieldCheck size={17} className={styles.shield} />
                <span>Your payment is protected by Paystack&apos;s secure checkout.</span>
              </div>
            </div>
          ) : state.error ? (
            <>
              <span className={styles.eyebrow}>PAYMENT UPDATE</span>
              <h1>Payment could not be confirmed</h1>
              <p className={styles.copy}>{state.error}</p>
              <button
                className={styles.action}
                type="button"
                onClick={() => (isDonation ? router.push("/donate") : router.back())}
              >
                {isDonation ? "Return to donation page" : "Return to checkout"}
              </button>
            </>
          ) : (
            <p>Payment confirmed. Preparing your confirmation…</p>
          )}
        </section>
        {!state.isDonation && (
          <PaymentSuccessModal
            isOpen={!state.loading && !state.error && Boolean(state.data)}
            onClose={() => router.push(state.data?.eventSlug ? `/events/${state.data.eventSlug}` : "/events")}
            orderData={state.data}
          />
        )}
      </main>
    </>
  );
}
