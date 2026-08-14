import Head from "next/head";
import { useRouter } from "next/router";
import { TALENT_DIRECTORY_ITEMS } from "@/constants/talents";
import { getTalentBySlug } from "@/utils/talentHelpers";
import { TalentProfile } from "@/components/talents";

export default function TalentDetailPage({ talent }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg">Loading talent profile...</p>
      </div>
    );
  }

  const currentTalent = talent || TALENT_DIRECTORY_ITEMS[0];

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
  const paths = TALENT_DIRECTORY_ITEMS.map((item) => ({
    params: { slug: item.slug || item.id },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const talent = getTalentBySlug(params?.slug);

  if (!talent) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      talent,
    },
    revalidate: 60,
  };
}
