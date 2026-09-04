import Head from "next/head";
import { EventsAdmin } from "@/components/events/EventsAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function EventsAdminPage() {
  return (
    <>
      <Head>
        <title>Events | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <EventsAdmin />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.events);
}
