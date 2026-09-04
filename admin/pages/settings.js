import Head from "next/head";
import { SettingsAdmin } from "@/components/settings/SettingsAdmin";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";

export default function SettingsPage({ admin }) {
  return (
    <>
      <Head>
        <title>Settings & Diagnostics | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SettingsAdmin admin={admin} />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.settings);
}

