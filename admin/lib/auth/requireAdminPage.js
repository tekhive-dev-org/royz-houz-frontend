import { getAuthenticatedAdmin } from "@/services/server/adminAuthorizationService";
import { getSafeRedirectPath } from "./redirect";

/**
 * Pages Router SSR guard. Use it from getServerSideProps for every admin page
 * containing protected content; client guards are only an additional UX layer.
 */
export async function requireAdminPage(context) {
  const result = await getAuthenticatedAdmin(context.req, context.res);
  if (result.status === "authorized") {
    return { props: { admin: result.admin } };
  }

  const next = getSafeRedirectPath(context.resolvedUrl, "/");
  if (result.status === "unauthenticated") {
    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(next)}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: "/unauthorized",
      permanent: false,
    },
  };
}
