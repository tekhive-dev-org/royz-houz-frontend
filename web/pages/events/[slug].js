import Head from "next/head";
import { useRouter } from "next/router";
import { EventOverview } from "@/components/events";
import { SupportMovement } from "@/components/home";
import { getEventBySlug, listEvents } from "@/services/content/eventService";

export default function EventDetailPage({ event, popularEvents }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg font-medium">Loading event overview...</p>
      </div>
    );
  }

  const currentEvent = event;

  return (
    <>
      <Head>
        <title>{`${currentEvent.title} | RoyzHouz Events`}</title>
        <meta
          name="description"
          content={
            currentEvent.aboutParagraphs?.[0] ||
            `Join ${currentEvent.title} on RoyzHouz. Reserve your tickets now.`
          }
        />
        <meta property="og:title" content={`${currentEvent.title} | RoyzHouz`} />
        <meta
          property="og:description"
          content={
            currentEvent.aboutParagraphs?.[0] ||
            `Join ${currentEvent.title} on RoyzHouz.`
          }
        />
        <meta
          property="og:image"
          content={currentEvent.heroImage || currentEvent.image}
        />
      </Head>

      <main className="w-full min-h-screen bg-[#FDFCFB]">
        {/* Full Event Overview Layout */}
        <EventOverview event={currentEvent} popularEvents={popularEvents} />

        {/* Bottom Support Movement Banner */}
        <SupportMovement />
      </main>
    </>
  );
}

export async function getStaticPaths() {
  try {
    const result = await listEvents();
    const paths = result.success
      ? result.data.map((event) => ({ params: { slug: event.slug } }))
      : [];

    return {
      paths,
      fallback: "blocking",
    };
  } catch {
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const [result, popularResult] = await Promise.all([
      getEventBySlug(params?.slug),
      listEvents(),
    ]);

    if (!result.success || !result.data) {
      return { notFound: true, revalidate: 60 };
    }

    return {
      props: {
        event: result.data,
        popularEvents: popularResult.success ? popularResult.data.filter((item) => item.isPopular && item.slug !== result.data.slug) : [],
      },
      revalidate: 60,
    };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}
