import Head from "next/head";
import { useRouter } from "next/router";
import { TalentVideoPlayer } from "@/components/talents";
import {
  findTalentMedia,
  getTalentMediaItems,
} from "@/components/talents/TalentVideoPlayer/talentVideoUtils";
import { getTalentBySlug, listTalents } from "@/services/content/talentService";

export default function TalentMediaDetailPage({ talent, media }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg">Loading media...</p>
      </div>
    );
  }

  const isMusic = media.mediaType === "music";

  return (
    <>
      <Head>
        <title>{`${media.title} — ${talent.name} | RoyzHouz`}</title>
        <meta
          name="description"
          content={`${isMusic ? "Listen to" : "Watch"} ${media.title} by ${talent.name} on RoyzHouz Talent Hub.`}
        />
        <meta property="og:title" content={`${media.title} — ${talent.name}`} />
        {media.thumbnail ? <meta property="og:image" content={media.thumbnail} /> : null}
        <meta property="og:type" content={isMusic ? "music.song" : "video.other"} />
      </Head>

      <TalentVideoPlayer talent={talent} media={media} />
    </>
  );
}

export async function getStaticPaths() {
  try {
    const result = await listTalents();
    if (!result.success) return { paths: [], fallback: "blocking" };

    const paths = result.data.flatMap((talent) => {
      const slug = talent.slug || talent.id;
      if (!slug) return [];

      return getTalentMediaItems(talent).map((item) => ({
        params: { slug: String(slug), mediaSlug: item.slug },
      }));
    });

    return { paths, fallback: "blocking" };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const result = await getTalentBySlug(params?.slug);
    if (!result.success) return { notFound: true, revalidate: 60 };

    const talent = result.data;
    const requestedMediaSlug = String(params?.mediaSlug || "");
    const media = findTalentMedia(talent, requestedMediaSlug);
    if (!media) return { notFound: true, revalidate: 60 };

    if (requestedMediaSlug !== media.slug) {
      return {
        redirect: {
          destination: `/talents/${talent.slug}/media/${media.slug}`,
          permanent: true,
        },
      };
    }

    return { props: { talent, media }, revalidate: 60 };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}
