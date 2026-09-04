import Head from "next/head";
import { MediaAdmin } from "@/components/media/MediaAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function MediaAdminPage() {
  return (
    <>
      <Head>
        <title>Media | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <MediaAdmin />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.media);
}
