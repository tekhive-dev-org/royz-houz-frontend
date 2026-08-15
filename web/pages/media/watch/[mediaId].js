import Head from "next/head";
import { useRouter } from "next/router";
import {
  MEDIA_VIDEOS,
  MEDIA_PODCASTS,
  MEDIA_DISCOVER_SOUNDS,
  MEDIA_ALL_MUSIC_TRACKS,
  MEDIA_MUSIC_SPOTLIGHT,
  MEDIA_GALLERY_PHOTOS,
  FEATURED_HERO_MEDIA,
} from "@/constants/media";
import { TALENT_DIRECTORY_ITEMS } from "@/constants/talents";
import { TalentVideoPlayer } from "@/components/talents";

export default function MediaWatchDetailPage({ talent, video }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg">Loading media...</p>
      </div>
    );
  }

  const currentTalent = talent || {
    name: "John Donald",
    category: "Musician",
    followers: "125K followers",
    bio: "John Donald is an emerging Afro-pop and R&B dancer from Lagos, Nigeria, known for his warm vocals, heartfelt lyrics, and vibrant stage presence.",
    image: "/assets/img/talents/charles.jpg",
    coverImage: "/assets/img/about/moments.jpg",
    slug: "john-donald",
    videoReel: {
      title: "The Beat Behind The Hit",
      thumbnail: "/assets/img/about/gallery/gallery-4.jpg",
      portfolioItems: [
        { id: "p1", title: "Pulse of the Streets", subtitle: "Afrofusion / Hip-Hop", duration: "3:28" },
        { id: "p2", title: "Movement Unbound", subtitle: "Contemporary Fusion", duration: "3:42", isActive: true },
        { id: "p3", title: "Rhythm & Roots", subtitle: "African / Hip-Hop Fusion", duration: "4:01" },
        { id: "p4", title: "Beyond the Beat", subtitle: "Traditional - Afro-fusion", duration: "4:18" },
      ],
      upNextVideos: [
        { id: "un-1", title: "Movement & Identity", artist: "Favour Ekanem", duration: "4:51", thumbnail: "/assets/img/about/gallery/gallery-4.jpg" },
        { id: "un-2", title: "African Ballet Fusion", artist: "Blessing Moses", duration: "3:28", thumbnail: "/assets/img/about/gallery/gallery-2.jpg" },
        { id: "un-3", title: "Rhythm Without Borders", artist: "Chisom Okeke", duration: "4:18", thumbnail: "/assets/img/events/event1.jpg" },
      ],
    },
    relatedCategoryTitle: "More Dancers",
    relatedCreatives: [
      { id: "rel-1", name: "Blessing Moses", category: "Afro-contemporary / Ballet", image: "/assets/img/talents/amara.jpg", slug: "blessing-moses" },
      { id: "rel-2", name: "Chisom Okeke", category: "Afro-contemporary", image: "/assets/img/talents/zara.jpg", slug: "chisom-okeke" },
      { id: "rel-3", name: "Samuel Ajayi", category: "Afrobeats / Popping", image: "/assets/img/talents/fatima.jpg", slug: "samuel-ajayi" },
    ],
  };

  const currentVideo = video || {
    id: "the-beat-behind-the-hit",
    title: "The Beat Behind The Hit",
    thumbnail: "/assets/img/about/gallery/gallery-4.jpg",
    duration: 214,
  };

  return (
    <>
      <Head>
        <title>{`${currentVideo.title} — ${currentTalent.name} | Royz House Media`}</title>
        <meta
          name="description"
          content={`Watch ${currentVideo.title} featuring ${currentTalent.name} on Royz House Media.`}
        />
        <meta property="og:title" content={`${currentVideo.title} — ${currentTalent.name}`} />
        <meta property="og:image" content={currentVideo.thumbnail} />
      </Head>

      <TalentVideoPlayer
        talent={currentTalent}
        video={currentVideo}
        breadcrumbRoot={{ label: "Media", href: "/media" }}
      />
    </>
  );
}

export async function getStaticPaths() {
  const allIds = [
    "the-beat-behind-the-hit",
    "creative-women-rising",
    "rhythm-without-borders",
    "beyond-the-stage",
    ...MEDIA_VIDEOS.map((v) => v.id),
    ...MEDIA_PODCASTS.map((p) => p.id),
    ...MEDIA_DISCOVER_SOUNDS.map((d) => d.id),
    ...MEDIA_ALL_MUSIC_TRACKS.map((m) => m.id),
    ...MEDIA_MUSIC_SPOTLIGHT.tracks.map((t) => t.id),
    ...MEDIA_GALLERY_PHOTOS.map((g) => g.id),
  ];

  const uniqueIds = Array.from(new Set(allIds));

  const paths = uniqueIds.map((mediaId) => ({
    params: { mediaId },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const mediaId = params?.mediaId || "the-beat-behind-the-hit";

  // Match item from any media list
  const foundVideo =
    MEDIA_VIDEOS.find((v) => v.id === mediaId) ||
    MEDIA_PODCASTS.find((p) => p.id === mediaId) ||
    MEDIA_DISCOVER_SOUNDS.find((d) => d.id === mediaId) ||
    MEDIA_ALL_MUSIC_TRACKS.find((m) => m.id === mediaId) ||
    MEDIA_MUSIC_SPOTLIGHT.tracks.find((t) => t.id === mediaId) ||
    (mediaId === "featured-track" ? MEDIA_MUSIC_SPOTLIGHT.featuredTrack : null) ||
    MEDIA_GALLERY_PHOTOS.find((g) => g.id === mediaId) ||
    (mediaId === "beyond-the-stage" ? FEATURED_HERO_MEDIA : null);

  const matchedArtist = foundVideo?.artist || foundVideo?.author?.name || "John Donald";
  const matchedTalentSlug =
    foundVideo?.author?.slug ||
    matchedArtist.toLowerCase().replace(/\s+/g, "-") ||
    "john-donald";

  const talentMatch = TALENT_DIRECTORY_ITEMS.find(
    (t) => t.slug === matchedTalentSlug || t.name?.toLowerCase() === matchedArtist.toLowerCase()
  );

  const coverArt =
    foundVideo?.coverImage ||
    foundVideo?.thumbnail ||
    foundVideo?.image ||
    talentMatch?.coverImage ||
    "/assets/img/talents/guitar.jpg";

  const isMusic = Boolean(foundVideo?.genre || foundVideo?.artist || foundVideo?.coverImage);

  const talent = {
    name: matchedArtist,
    category: isMusic ? (foundVideo?.genre || "Music Artist / Producer") : (foundVideo?.author?.category || talentMatch?.category || "Musician"),
    followers: foundVideo?.author?.followers || talentMatch?.followers || "125K followers",
    bio:
      foundVideo?.author?.bio ||
      talentMatch?.bio ||
      `${matchedArtist} is an extraordinary African creative, known for expressive original productions and storytelling.`,
    image: foundVideo?.author?.avatar || talentMatch?.image || coverArt,
    coverImage: coverArt,
    slug: matchedTalentSlug,
    videoReel: {
      title: foundVideo?.title || "The Beat Behind The Hit",
      thumbnail: coverArt,
      portfolioItems: isMusic
        ? MEDIA_ALL_MUSIC_TRACKS.slice(0, 4).map((t, idx) => ({
            id: t.id,
            title: t.title,
            subtitle: t.genre || "Afro-Pop / R&B",
            duration: "3:42",
            isActive: t.id === mediaId || idx === 0,
            thumbnail: t.coverImage,
          }))
        : [
            { id: "p1", title: "Pulse of the Streets", subtitle: "Afrofusion / Hip-Hop", duration: "3:28" },
            { id: "p2", title: "Movement Unbound", subtitle: "Contemporary Fusion", duration: "3:42", isActive: true },
            { id: "p3", title: "Rhythm & Roots", subtitle: "African / Hip-Hop Fusion", duration: "4:01" },
            { id: "p4", title: "Beyond the Beat", subtitle: "Traditional - Afro-fusion", duration: "4:18" },
          ],
      upNextVideos: isMusic
        ? MEDIA_ALL_MUSIC_TRACKS.slice(4, 7).map((t) => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            duration: "4:15",
            thumbnail: t.coverImage,
          }))
        : [
            { id: "un-1", title: "Movement & Identity", artist: "Favour Ekanem", duration: "4:51", thumbnail: "/assets/img/about/gallery/gallery-4.jpg" },
            { id: "un-2", title: "African Ballet Fusion", artist: "Blessing Moses", duration: "3:28", thumbnail: "/assets/img/about/gallery/gallery-2.jpg" },
            { id: "un-3", title: "Rhythm Without Borders", artist: "Chisom Okeke", duration: "4:18", thumbnail: "/assets/img/events/event1.jpg" },
          ],
    },
    relatedCategoryTitle: isMusic ? "More Music Artists" : "More Dancers",
    relatedCreatives: [
      { id: "rel-1", name: "Lena Bassey", category: "R&B / Soul", image: "/assets/img/talents/upnext-beautiful-chaos.jpg", slug: "lena-bassey" },
      { id: "rel-2", name: "Rita Nkem", category: "Afrobeats / Dancehall", image: "/assets/img/talents/producer-hero.jpg", slug: "rita-nkem" },
      { id: "rel-3", name: "Seyi Mars", category: "Afro-Pop/R&B", image: "/assets/img/talents/guitar.jpg", slug: "seyi-mars" },
    ],
  };

  const video = {
    id: mediaId,
    title: foundVideo?.title || "The Beat Behind The Hit",
    thumbnail: coverArt,
    duration: 214,
  };

  return {
    props: {
      talent,
      video,
    },
    revalidate: 60,
  };
}
