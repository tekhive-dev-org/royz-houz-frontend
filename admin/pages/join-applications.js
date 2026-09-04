import Head from "next/head";
import { SubmissionsAdmin } from "@/components/submissions/SubmissionsAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function JoinApplicationsAdminPage() {
  return (
    <>
      <Head>
        <title>Join Applications | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SubmissionsAdmin
        module="applications"
        title="Join applications"
        description="Review, assign, and resolve talent join applications."
      />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES["join-applications"]);
}
