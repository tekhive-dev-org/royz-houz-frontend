import Head from "next/head";
import { DocsShell } from "@/components/docs/DocsShell";
import { DOCS_CHAPTERS } from "@/constants/docsData";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function DocsSubPage({ chapter }) {
  if (!chapter) return null;

  return (
    <>
      <Head>
        <title>{chapter.title} | Royz Houz Documentation</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <DocsShell chapter={chapter} />
    </>
  );
}

export async function getServerSideProps(context) {
  const guard = await requireAdminFeature(context, ADMIN_FEATURES.docs);
  if (guard.redirect) {
    return guard;
  }

  const { slug } = context.params;
  const chapter = DOCS_CHAPTERS.find((c) => c.slug === slug);

  if (!chapter) {
    return {
      redirect: {
        destination: "/docs",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...guard.props,
      chapter,
    },
  };
}
