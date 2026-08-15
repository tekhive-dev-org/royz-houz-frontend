import Head from "next/head";
import { useRouter } from "next/router";
import { TALENT_DIRECTORY_ITEMS } from "@/constants/talents";
import { getTalentBySlug } from "@/utils/talentHelpers";
import { TalentBooking } from "@/components/talents";

export default function TalentBookingPage({ talent }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white text-[#0A0D14]">
        <p className="text-sm font-semibold">Loading booking form...</p>
      </div>
    );
  }

  const currentTalent = talent || TALENT_DIRECTORY_ITEMS[0];

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
