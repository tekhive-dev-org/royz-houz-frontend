import Head from "next/head";
import { useRouter } from "next/router";
import { TALENT_DIRECTORY_ITEMS } from "@/constants/talents";
import { TalentProfile } from "@/components/talents";
import { getTalentBySlug, listTalents } from "@/services/content/talentService";

export default function TalentDetailPage({ talent }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg">Loading talent profile...</p>
      </div>
    );
  }

  const currentTalent = talent;

  return (
    <>
      <Head>
        <title>{`${currentTalent.name} — ${currentTalent.category} | RoyzHouz`}</title>
        <meta
          name="description"
          content={
            currentTalent.bio
              ? currentTalent.bio.slice(0, 160)
              : `Discover ${currentTalent.name}, ${currentTalent.category} on RoyzHouz Talent Hub.`
          }
        />
        <meta property="og:title" content={`${currentTalent.name} | RoyzHouz`} />
        <meta
          property="og:description"
          content={currentTalent.bio || currentTalent.subtitle}
        />
        <meta property="og:image" content={currentTalent.image} />
      </Head>

      <TalentProfile talent={currentTalent} />
    </>
  );
}

export async function getStaticPaths() {
  let talents = TALENT_DIRECTORY_ITEMS;

  try {
    const result = await listTalents();
    if (result.success) talents = result.data;
  } catch {
    // Known public route slugs keep the build resilient when Supabase is unavailable.
  }

  return {
    paths: talents
      .map((talent) => talent.slug || talent.id)
      .filter(Boolean)
      .map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  try {
    const result = await getTalentBySlug(params?.slug);
    if (!result.success) return { notFound: true, revalidate: 60 };

    return {
      props: { talent: result.data },
      revalidate: 60,
    };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}
