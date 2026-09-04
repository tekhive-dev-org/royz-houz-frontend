import { getTalentBySlug } from "@/services/content/talentService";
import { findTalentVideo } from "@/components/talents/TalentVideoPlayer/talentVideoUtils";

/**
 * Backward-compatible redirect from the legacy `/video/[videoSlug]` URL
 * to the unified productions `/media/[mediaSlug]` route.
 */
export default function LegacyTalentVideoRedirectPage() {
  return null;
}

export async function getStaticPaths() {
  // Keep legacy redirect routes out of the build. Next.js cannot prerender a
  // page whose getStaticProps always returns a redirect; blocking fallback
  // preserves runtime compatibility for previously shared URLs.
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  try {
    const result = await getTalentBySlug(params?.slug);
    if (!result.success) return { notFound: true, revalidate: 60 };

    const talent = result.data;
    const video = findTalentVideo(talent, params?.videoSlug);
    if (!video) return { notFound: true, revalidate: 60 };

    return {
      redirect: {
        destination: `/talents/${talent.slug}/media/${video.slug}`,
        permanent: true,
      },
    };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}
