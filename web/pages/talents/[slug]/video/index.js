import { getTalentBySlug } from "@/services/content/talentService";
import { getTalentMediaItems } from "@/components/talents/TalentVideoPlayer/talentVideoUtils";

export default function LegacyTalentVideoIndexRedirectPage() {
  return null;
}

export async function getStaticPaths() {
  // Keep the redirect-only compatibility route runtime-rendered so production
  // builds do not attempt to prerender a redirect response.
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  try {
    const result = await getTalentBySlug(params?.slug);
    if (!result.success) return { notFound: true, revalidate: 60 };

    const talent = result.data;
    const [media] = getTalentMediaItems(talent);
    if (!media) return { notFound: true, revalidate: 60 };

    return {
      redirect: {
        destination: `/talents/${talent.slug}/media/${media.slug}`,
        permanent: false,
      },
    };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}
