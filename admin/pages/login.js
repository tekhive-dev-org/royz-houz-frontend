import Head from "next/head";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { getAuthenticatedAdmin } from "@/services/server/adminAuthorizationService";

export default function LoginPage({ next, sessionExpired }) {
  return (
    <>
      <Head>
        <title>Admin Sign In | Royz Houz</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminLoginForm next={next} sessionExpired={sessionExpired} />
    </>
  );
}

LoginPage.getLayout = (page) => page;

export async function getServerSideProps(context) {
  const result = await getAuthenticatedAdmin(context.req, context.res);
  const next = getSafeRedirectPath(context.query.next, "/");

  if (result.status === "authorized") {
    return { redirect: { destination: next, permanent: false } };
  }

  if (result.status === "unauthorized") {
    return { redirect: { destination: "/unauthorized", permanent: false } };
  }

  return {
    props: {
      next,
      sessionExpired: context.query.reason === "session-expired",
    },
  };
}
