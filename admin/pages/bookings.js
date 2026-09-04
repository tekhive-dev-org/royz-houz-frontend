import Head from "next/head";
import { BookingsAdmin } from "@/components/bookings/BookingsAdmin";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { adminHasExactPermission } from "@/services/server/adminAuthorizationService";

export default function BookingsPage({ canUpdate }) { return <><Head><title>Talent Bookings | Royz Houz Admin</title><meta name="robots" content="noindex, nofollow" /></Head><BookingsAdmin canUpdate={canUpdate} /></>; }
export async function getServerSideProps(context) { const access = await requireAdminFeature(context, ADMIN_FEATURES.bookings); if (access.redirect) return access; const canUpdate = await adminHasExactPermission(access.props.admin.userId, "bookings.update"); return { props: { ...access.props, canUpdate } }; }
