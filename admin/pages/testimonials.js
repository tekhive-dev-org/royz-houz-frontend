import Head from "next/head";
import { TestimonialsAdmin } from "@/components/testimonials";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function TestimonialsAdminPage() {
  return (
    <>
      <Head>
        <title>Testimonials | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <TestimonialsAdmin />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.testimonials);
}
