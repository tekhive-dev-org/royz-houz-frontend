import Head from "next/head";
import { AccessControlAdmin } from "@/components/access-control/AccessControlAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function UsersAndRolesAdminPage({ admin }) {
  return (
    <>
      <Head>
        <title>Users and Roles | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AccessControlAdmin actorUserId={admin?.userId} />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES["users-and-roles"]);
}
