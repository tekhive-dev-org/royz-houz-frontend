import Head from "next/head";
import { SectionsEditor } from "@/components/content/SectionsEditor";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function HomepageAdminPage() {
  return (
    <>
      <Head>
        <title>Homepage | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SectionsEditor
        type="homepage"
        title="Homepage Section Studio"
        description="Arrange section flow, customize headlines & CTAs, and control live visibility across the public landing page."
      />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.homepage);
}
