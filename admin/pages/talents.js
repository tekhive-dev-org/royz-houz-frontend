import Head from "next/head";
import { TalentsAdmin } from "@/components/talents/TalentsAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function TalentsAdminPage() {
  return (
    <>
      <Head>
        <title>Talents | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <TalentsAdmin />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.talents);
}
