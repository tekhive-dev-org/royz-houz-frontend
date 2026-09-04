import Head from "next/head";
import { AuditLogs } from "@/components/access-control/AuditLogs";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function AuditLogsAdminPage() {
  return (
    <>
      <Head>
        <title>Audit Logs | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AuditLogs />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES["audit-logs"]);
}
