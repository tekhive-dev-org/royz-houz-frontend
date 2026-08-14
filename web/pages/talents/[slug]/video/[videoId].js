import Head from "next/head";
import { useRouter } from "next/router";
import { TALENT_DIRECTORY_ITEMS } from "@/constants/talents";
import { getTalentBySlug } from "@/utils/talentHelpers";
import { TalentVideoPlayer } from "@/components/talents";

export default function TalentVideoDetailPage({ talent, video }) {
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
    id: "prod-reel",
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
        <meta property="og:title" content={`${currentVideo.title} — ${currentTalent.name}`} />
        <meta property="og:image" content={currentVideo.thumbnail} />
      </Head>

      <TalentVideoPlayer talent={currentTalent} video={currentVideo} />
    </>
  );
}

export async function getStaticPaths() {
  const paths = [];
  const videoIds = [
    "the-sound-architect",
    "production-reel",
    "golden-hour",
    "beautiful-chaos",
    "new-beginnings",
    "v1",
    "v2",
    "v3",
    "v4",
    "v5",
    "v6",
    "v7",
  ];

  TALENT_DIRECTORY_ITEMS.forEach((item) => {
    const slug = item.slug || item.id;
    videoIds.forEach((videoId) => {
      paths.push({
        params: { slug, videoId },
      });
    });
  });

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

  const videoTitles = {
    "the-sound-architect": "The Sound Architect",
    "production-reel": "Production Reel",
    "golden-hour": "Golden Hour",
    "acting-showreel": "Acting Showreel",
    "performance-portfolio": "Performance Portfolio — Favour Ekanem",
    "creator-reel": "Adaobi Nwankwo — Creator Reel",
    "letters-from-home": "Letters From Home",
    "beautiful-chaos": "Beautiful Chaos",
    "new-beginnings": "New Beginnings",
    "v1": talent.videoReel?.title || "Featured Video",
    "v2": talent.videoReel?.title || "Featured Video",
  };

  const video = {
    id: params.videoId || talent.videoReel?.id || "the-sound-architect",
    title:
      videoTitles[params.videoId] ||
      talent.videoReel?.title ||
      "The Sound Architect",
    thumbnail:
      talent.videoReel?.thumbnail ||
      (params.videoId === "the-sound-architect"
        ? "/assets/img/talents/producer-video-frame.jpg"
        : talent.coverImage || "/assets/img/talents/producer-video-frame.jpg"),
  };

  return {
    props: {
      talent,
      video,
    },
    revalidate: 60,
  };
}
