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
        title="Homepage sections"
        description="Manage homepage section order, copy, CTAs, and media without changing the public layout."
      />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.homepage);
}
