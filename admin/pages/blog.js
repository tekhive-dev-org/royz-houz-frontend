import Head from "next/head";
import { BlogAdmin } from "@/components/blog/BlogAdmin";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function BlogAdminPage() {
  return (
    <>
      <Head>
        <title>Blog | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <BlogAdmin />
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.blog);
}
