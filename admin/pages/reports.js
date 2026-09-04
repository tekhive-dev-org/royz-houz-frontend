import Head from "next/head";
import { ContentReportsAdmin } from "@/components/reports/ContentReportsAdmin";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { adminHasExactPermission } from "@/services/server/adminAuthorizationService";

export default function ContentReportsPage({ canModerate }) {
  return (
    <>
      <Head>
        <title>Content Reports | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ContentReportsAdmin canModerate={canModerate} />
    </>
  );
}

export async function getServerSideProps(context) {
  const access = await requireAdminFeature(context, ADMIN_FEATURES.reports);
  if (access.redirect) return access;

  const canModerate = await adminHasExactPermission(
    access.props.admin.userId,
    "reports.moderate"
  );
  return { props: { ...access.props, canModerate } };
}
