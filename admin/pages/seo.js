import Head from "next/head";
import { SeoAdmin } from "@/components/seo/SeoAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function SeoAdminPage() {
  return (
    <>
      <Head>
        <title>SEO | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SeoAdmin />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.seo);
}
