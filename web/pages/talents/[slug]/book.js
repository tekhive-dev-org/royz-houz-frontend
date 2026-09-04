import Head from "next/head";
import { useRouter } from "next/router";

import { TalentBooking } from "@/components/talents";
import { getTalentBySlug, listTalents } from "@/services/content/talentService";

export default function TalentBookingPage({ talent }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white text-[#0A0D14]">
        <p className="text-sm font-semibold">Loading booking form...</p>
      </div>
    );
  }

  const currentTalent = talent;

  return (
    <>
      <Head>
        <title>{`Book ${currentTalent.name} | RoyzHouz Talent Hub`}</title>
        <meta
          name="description"
          content={`Submit a booking request for ${currentTalent.name} on RoyzHouz.`}
        />
      </Head>

      <TalentBooking talent={currentTalent} />
    </>
  );
}

export async function getStaticPaths() {
  try {
    const result = await listTalents();
    const talents = result.success ? result.data : [];
    return {
      paths: talents.map((talent) => talent.slug).filter(Boolean).map((slug) => ({ params: { slug } })),
      fallback: "blocking",
    };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  try {
    const result = await getTalentBySlug(params?.slug);
    if (!result.success) return { notFound: true, revalidate: 60 };

    return { props: { talent: result.data }, revalidate: 60 };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}
