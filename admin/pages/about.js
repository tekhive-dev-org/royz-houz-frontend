import Head from "next/head";
import { AboutAdmin } from "@/components/about/AboutAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function AboutAdminPage() {
  return (
    <>
      <Head>
        <title>About Page Studio | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AboutAdmin />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.about);
}
