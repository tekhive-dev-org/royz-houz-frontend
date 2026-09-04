import Head from "next/head";
import { NewsletterAdmin } from "@/components/newsletter/NewsletterAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function NewsletterPage() {
  return <><Head><title>Newsletter | Royz Houz Admin</title><meta name="robots" content="noindex, nofollow" /></Head><NewsletterAdmin /></>;
}

export async function getServerSideProps(context) { return requireAdminFeature(context, ADMIN_FEATURES.newsletter); }
