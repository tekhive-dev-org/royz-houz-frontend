import { useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { TalentVideoPlayer } from "@/components/talents";
import { getMediaBySlug, listMedia, listPublicMediaAssets } from "@/services/content/mediaService";
import { listTalents } from "@/services/content/talentService";
import { FEATURED_HERO_MEDIA, MEDIA_VIDEOS } from "@/constants/media";
import { FEATURED_TALENTS } from "@/constants/talents";
import { formatBannerDuration, formatDisplayDuration } from "@/adapters/mediaAdapter";
import { parseMediaDurationToSeconds } from "@/components/talents/TalentVideoPlayer/talentVideoUtils";

export default function MediaWatchDetailPage({ media, relatedMedia = [] }) {
  const router = useRouter();

  const thumbnail = media?.thumbnail || "/assets/img/about/gallery/gallery-4.jpg";
  const creator = media?.author?.name || media?.host || media?.artist || "Royz Houz";

  // Main user-friendly duration (e.g. "3 mins", "24 mins", or formatted timestamp)
  const userFriendlyDuration =
    formatBannerDuration(media?.duration || media?.duration_seconds) ||
    formatDisplayDuration(media?.duration || media?.duration_seconds) ||
    "";

  const talent = useMemo(() => {
    if (!media) return null;

    const relatedItems = Array.isArray(relatedMedia)
      ? relatedMedia
          .filter((item) => String(item.slug || item.id) !== String(media.slug || media.id))
          .map((item) => ({
            id: item.slug || item.id,
            title: item.title,
            subtitle: item.subtitle || item.category || "",
            duration:
              formatBannerDuration(item.duration) ||
              formatDisplayDuration(item.duration) ||
              item.duration ||
              "",
            thumbnail: item.thumbnail || thumbnail,
            videoUrl: item.videoUrl,
            mediaType: "video",
          }))
      : [];

    const authorPhoto =
      media.author?.avatar ||
      media.author?.image ||
      media.artistAvatar ||
      "/assets/img/talents/julius.jpg";

    const authorCover =
      media.author?.coverImage ||
      media.coverImage ||
      thumbnail;

    const isRosterTalent = Boolean(media.author?.isRosterTalent);
    const talentSlug = isRosterTalent ? (media.author?.slug || media.author?.id || null) : null;

    return {
      name: creator,
      category: media.genre || media.category || "Royz House Media",
      followers: isRosterTalent ? (media.author?.followers || "") : "",
      bio: media.description || media.subtitle || "",
      image: authorPhoto,
      coverImage: authorCover,
      slug: talentSlug,
      isRosterTalent,
      hasTalentProfile: isRosterTalent,
      videoReel: {
        title: media.title,
        thumbnail,
        portfolioItems: [
          {
            id: media.slug,
            title: media.title,
            subtitle: media.subtitle || media.genre || "",
            duration: userFriendlyDuration,
            thumbnail,
            isActive: true,
          },
          ...relatedItems,
        ],
        upNextVideos: relatedItems,
      },
      videos: relatedItems,
      relatedCategoryTitle: "More Media",
      relatedCreatives: [],
    };
  }, [creator, media, relatedMedia, thumbnail, userFriendlyDuration]);

  const isAudio =
    media?.mediaType === "music" ||
    media?.mediaType === "audio" ||
    Boolean(media?.audioUrl || media?.trackUrl);

  const playerMedia = useMemo(() => {
    if (!media) return null;
    const mediaType = isAudio ? "music" : "video";
    return {
      id: media.slug,
      databaseId: media.databaseId || media.id,
      slug: media.slug,
      title: media.title,
      subtitle: media.subtitle || media.genre || media.artist || media.description || "",
      category: media.genre || media.category || (isAudio ? "Music" : "Video"),
      views: media.views || "",
      viewCount: media.viewCount || 0,
      publishedAt: media.publishedAt || "",
      thumbnail: media.coverImage || thumbnail,
      duration: parseMediaDurationToSeconds(media.duration || media.duration_seconds),
      displayDuration: userFriendlyDuration,
      videoUrl: media.videoUrl || media.audioUrl || "",
      trackUrl: media.audioUrl || media.trackUrl || media.videoUrl || "",
      mediaType,
    };
  }, [isAudio, media, thumbnail, userFriendlyDuration]);

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg">Loading media...</p>
      </div>
    );
  }

  // getStaticProps returns notFound for a missing/unpublished asset.
  if (!media || !talent || !playerMedia) return null;

  return (
    <>
      <Head>
        <title>{`${media.title} | Royz House Media`}</title>
        <meta
          name="description"
          content={media.description || media.subtitle || `Watch ${media.title} on Royz House Media.`}
        />
        <meta property="og:title" content={media.title} />
        <meta property="og:image" content={thumbnail} />
      </Head>

      <TalentVideoPlayer
        talent={talent}
        media={playerMedia}
        breadcrumbRoot={{ label: "Media", href: "/media" }}
      />
    </>
  );
}

export async function getStaticPaths() {
  const result = await listPublicMediaAssets();
  const paths = result.success ? result.data.map(({ slug }) => ({ params: { mediaId: slug } })) : [];

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const mediaId = params?.mediaId;
  if (!mediaId || typeof mediaId !== "string") return { notFound: true, revalidate: 60 };

  const [result, mediaListResult, talentsResult] = await Promise.all([
    getMediaBySlug(mediaId),
    listMedia({ type: "video" }),
    listTalents(),
  ]);

  const relatedMedia = mediaListResult.success ? mediaListResult.data : [];
  const publishedTalents = talentsResult.success ? talentsResult.data : [];
  const allTalents = [...FEATURED_TALENTS, ...publishedTalents];

  if (result.success && result.data) {
    const media = { ...result.data };
    const talentSlug = media.author?.slug || media.authorTalentId || media.artistTalentId;
    const talentName = media.author?.name || media.artist || media.host;

    const matchedTalent = allTalents.find(
      (t) =>
        (talentSlug &&
          (String(t.slug).toLowerCase() === String(talentSlug).toLowerCase() ||
           String(t.id).toLowerCase() === String(talentSlug).toLowerCase())) ||
        (talentName &&
          talentName.toLowerCase() !== "royz houz" &&
          talentName.toLowerCase() !== "royz houz production" &&
          String(t.name).toLowerCase() === String(talentName).toLowerCase())
    );

    if (matchedTalent) {
      media.author = {
        ...(media.author || {}),
        id: matchedTalent.id,
        name: matchedTalent.name,
        slug: matchedTalent.slug,
        avatar: media.author?.avatar || matchedTalent.image,
        coverImage: matchedTalent.coverImage || matchedTalent.image,
        bio: matchedTalent.bio || media.description || "",
        followers: matchedTalent.followers || "",
        isRosterTalent: true,
      };
    } else {
      media.author = {
        ...(media.author || {}),
        name: talentName || "Royz Houz",
        slug: null,
        isRosterTalent: false,
      };
    }
    return { props: { media, relatedMedia }, revalidate: 60 };
  }

  // Fallback to static constant video if matching slug or id
  const staticMatch =
    mediaId === "beyond-the-stage" || mediaId === "featured-home"
      ? {
          ...FEATURED_HERO_MEDIA,
          id: "beyond-the-stage",
          slug: "beyond-the-stage",
          category: "DOCUMENTARY",
          videoUrl: FEATURED_HERO_MEDIA.videoUrl,
          thumbnail: FEATURED_HERO_MEDIA.bgImage || FEATURED_HERO_MEDIA.thumbnail,
        }
      : MEDIA_VIDEOS.find((v) => v.id === mediaId || v.slug === mediaId);

  if (staticMatch) {
    return { props: { media: staticMatch, relatedMedia: MEDIA_VIDEOS }, revalidate: 60 };
  }

  return { notFound: true, revalidate: 60 };
}
