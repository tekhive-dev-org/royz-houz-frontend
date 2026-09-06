import Head from "next/head";
import { PaymentsAdmin } from "@/components/payments/PaymentsAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function PaymentsPage() {
  return <><Head><title>Ticket Payments | RoyzHouz Admin</title><meta name="robots" content="noindex, nofollow" /></Head><PaymentsAdmin /></>;
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.payments);
}
