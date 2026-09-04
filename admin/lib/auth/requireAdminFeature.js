import { adminHasExactPermission, getAuthenticatedAdmin } from "@/services/server/adminAuthorizationService";
import { getSafeRedirectPath } from "./redirect";

function toRedirect(context, destination) {
  return { redirect: { destination, permanent: false } };
}

/**
 * SSR guard for admin feature pages. It verifies general admin access and,
 * when the feature declares a read permission, the exact permission without
 * writing to the HTTP response (unlike the API-level helper).
 */
export async function requireAdminFeature(context, featureKey) {
  const access = await getAuthenticatedAdmin(context.req, context.res);

  if (access.status === "unauthenticated") {
    return toRedirect(context, `/login?next=${encodeURIComponent(getSafeRedirectPath(context.resolvedUrl, "/"))}`);
  }
  if (access.status === "unauthorized") {
    return toRedirect(context, "/unauthorized");
  }

  if (featureKey?.readPermission) {
    const permitted = await adminHasExactPermission(access.user.id, featureKey.readPermission);
    if (!permitted) return toRedirect(context, "/unauthorized");
  }

  return { props: { admin: access.admin } };
}
