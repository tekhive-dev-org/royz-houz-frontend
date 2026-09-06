import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PaymentSuccessModal } from "@/components/events/EventOverview/PaymentModals";
import styles from "./callback.module.css";

export default function PaystackCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    if (!router.isReady) return;
    const reference = typeof router.query.reference === "string" ? router.query.reference : typeof router.query.trxref === "string" ? router.query.trxref : "";
    if (!reference) {
      setState({ loading: false, error: "No payment reference was provided." });
      return;
    }
    fetch("/api/events/payment/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference }) })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || !body?.success) throw new Error(body?.error?.message || "Payment verification failed.");
        setState({ loading: false, error: "", data: body.data });
      })
      .catch((error) => setState({ loading: false, error: error.message }));
  }, [router.isReady, router.query.reference, router.query.trxref]);

  return (
    <>
      <Head><title>Ticket Payment | RoyzHouz</title></Head>
      <main className={styles.page}>
        <section className={styles.card}>
          {state.loading ? <div className={styles.loadingState} aria-live="polite"><div className={styles.brandLockup}><span className={styles.brandBadge}>RH</span><span>ROYZ HOUZ</span></div><div className={styles.loadingMark} aria-hidden="true"><span className={styles.spinner} /></div><span className={styles.eyebrow}>SECURE PAYMENT CHECK</span><h1>Confirming your payment</h1><p className={styles.copy}>We&apos;re securely verifying your Paystack transaction. Please keep this window open while we confirm your ticket.</p><div className={styles.progressTrack} aria-hidden="true"><span /></div><div className={styles.statusSteps}><span className={styles.stepDone}><i />Payment submitted</span><span className={styles.stepActive}><i />Verifying securely</span><span><i />Ticket issued</span></div><div className={styles.securityRow}><ShieldCheck size={17} className={styles.shield} /><span>Your payment is protected by Paystack&apos;s secure checkout.</span></div></div> : state.error ? <><span className={styles.eyebrow}>PAYMENT UPDATE</span><h1>Payment could not be confirmed</h1><p className={styles.copy}>{state.error}</p><button className={styles.action} type="button" onClick={() => router.back()}>Return to checkout</button></> : <p>Payment confirmed. Preparing your ticket confirmation…</p>}
        </section>
        <PaymentSuccessModal
          isOpen={!state.loading && !state.error}
          onClose={() => router.push(state.data?.eventSlug ? `/events/${state.data.eventSlug}` : "/events")}
          orderData={state.data}
        />
      </main>
    </>
  );
}
