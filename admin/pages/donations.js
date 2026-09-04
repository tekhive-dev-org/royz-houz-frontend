import Head from "next/head";
import { DonationsAdmin } from "@/components/donations/DonationsAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function DonationsAdminPage() {
  return (
    <>
      <Head>
        <title>Donations | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <DonationsAdmin />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.donations);
}
