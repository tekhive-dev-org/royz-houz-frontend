import Head from "next/head";
import { useRouter } from "next/router";
import { EventOverview } from "@/components/events";
import { SupportMovement } from "@/components/home";
import { getAllEventSlugs, getEventBySlug } from "@/utils/eventHelpers";
import { DEFAULT_EVENT_DETAILS } from "@/constants/events";

export default function EventDetailPage({ event }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-lg font-medium">Loading event overview...</p>
      </div>
    );
  }

  const currentEvent = event || DEFAULT_EVENT_DETAILS;

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
        <EventOverview event={currentEvent} />

        {/* Bottom Support Movement Banner */}
        <SupportMovement />
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const slugs = getAllEventSlugs();
  const paths = slugs.map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const event = getEventBySlug(params?.slug);

  if (!event) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      event,
    },
    revalidate: 60,
  };
}
