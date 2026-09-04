import Head from "next/head";
import { SubmissionsAdmin } from "@/components/submissions/SubmissionsAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function ContactsAdminPage() {
  return (
    <>
      <Head>
        <title>Contacts | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SubmissionsAdmin
        module="contacts"
        title="Contact submissions"
        description="Review, assign, and resolve public contact submissions."
      />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.contacts);
}
