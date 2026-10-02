import Head from "next/head";
import { DocsShell } from "@/components/docs/DocsShell";
import { DOCS_CHAPTERS } from "@/constants/docsData";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function DocsIndexPage() {
  const chapter = DOCS_CHAPTERS[0];

  return (
    <>
      <Head>
        <title>Documentation & White Paper | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <DocsShell chapter={chapter} />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.docs);
}
