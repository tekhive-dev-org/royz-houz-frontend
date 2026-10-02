import Head from "next/head";
import {
  HeroSection,
  FeaturedTalents,
  OurImpact,
  UpcomingEvents,
  MediaHighlight,
  LatestBlog,
  CommunityCTA,
  Testimonials,
  SupportMovement,
} from "@/components/home";
import { isHomepageSectionVisible } from "@/adapters/homepageAdapter";
import { getHomepageContent } from "@/services/content/homepageService";

const SECTION_COMPONENTS = {
  hero: HeroSection,
  featuredTalents: FeaturedTalents,
  ourImpact: OurImpact,
  upcomingEvents: UpcomingEvents,
  mediaHighlight: MediaHighlight,
  latestBlog: LatestBlog,
  communityCta: CommunityCTA,
  testimonials: Testimonials,
  supportMovement: SupportMovement,
};

const DEFAULT_ORDER = [
  "hero",
  "featuredTalents",
  "ourImpact",
  "upcomingEvents",
  "mediaHighlight",
  "latestBlog",
  "communityCta",
  "testimonials",
  "supportMovement",
];

export default function Home({ content = {} }) {
  const order =
    Array.isArray(content.sectionOrder) && content.sectionOrder.length > 0
      ? content.sectionOrder
      : DEFAULT_ORDER;

  return (
    <>
      <Head>
        <title>RoyzHouz | Building Africa&apos;s Next Generation</title>
        <meta
          name="description"
          content="Building Africa's next generation of creatives, leaders & innovators."
        />
      </Head>

      {order.map((key) => {
        const SectionComponent = SECTION_COMPONENTS[key];
        if (!SectionComponent || !isHomepageSectionVisible(content, key)) {
          return null;
        }
        return <SectionComponent key={key} content={content[key]} />;
      })}
    </>
  );
}

export async function getStaticProps() {
  try {
    const result = await getHomepageContent();
    return {
      props: { content: result.success ? result.data : {} },
      revalidate: 60,
    };
  } catch {
    // The page remains visually identical with its section-level constants when
    // Supabase is not configured or content is temporarily unavailable.
    return { props: { content: {} }, revalidate: 60 };
  }
}
