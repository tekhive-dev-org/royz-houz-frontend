import Head from "next/head";
import { useRouter } from "next/router";
import { TALENT_DIRECTORY_ITEMS } from "@/constants/talents";
import { getTalentBySlug } from "@/utils/talentHelpers";
import { TalentVideoPlayer } from "@/components/talents";

export default function TalentVideoIndexPage({ talent, video }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg">Loading video...</p>
      </div>
    );
  }

  const currentTalent = talent || TALENT_DIRECTORY_ITEMS[0];
  const currentVideo = video || {
    id: "the-sound-architect",
    title: "The Sound Architect",
    thumbnail: currentTalent.coverImage || "/assets/img/talents/producer-hero.jpg",
  };

  return (
    <>
      <Head>
        <title>{`${currentVideo.title} — ${currentTalent.name} | RoyzHouz`}</title>
        <meta
          name="description"
          content={`Watch ${currentVideo.title} by ${currentTalent.name} on RoyzHouz Talent Hub.`}
        />
      </Head>

      <TalentVideoPlayer talent={currentTalent} video={currentVideo} />
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

  const video = talent.videoReel || {
    id: "the-sound-architect",
    title: "The Sound Architect",
    thumbnail: talent.coverImage || "/assets/img/talents/producer-video-frame.jpg",
  };

  return {
    props: {
      talent,
      video,
    },
    revalidate: 60,
  };
}
