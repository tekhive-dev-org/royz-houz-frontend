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

export default function Home({ content = {} }) {
  return (
    <>
      <Head>
        <title>RoyzHouz | Building Africa&apos;s Next Generation</title>
        <meta
          name="description"
          content="Building Africa's next generation of creatives, leaders & innovators."
        />
        
      </Head>

      {isHomepageSectionVisible(content, "hero") && <HeroSection content={content.hero} />}
      {isHomepageSectionVisible(content, "featuredTalents") && (
        <FeaturedTalents content={content.featuredTalents} />
      )}
      {isHomepageSectionVisible(content, "ourImpact") && <OurImpact content={content.ourImpact} />}
      {isHomepageSectionVisible(content, "upcomingEvents") && (
        <UpcomingEvents content={content.upcomingEvents} />
      )}
      {isHomepageSectionVisible(content, "mediaHighlight") && (
        <MediaHighlight content={content.mediaHighlight} />
      )}
      {isHomepageSectionVisible(content, "latestBlog") && <LatestBlog content={content.latestBlog} />}
      {isHomepageSectionVisible(content, "communityCta") && (
        <CommunityCTA content={content.communityCta} />
      )}
      {isHomepageSectionVisible(content, "testimonials") && (
        <Testimonials content={content.testimonials} />
      )}
      {isHomepageSectionVisible(content, "supportMovement") && (
        <SupportMovement content={content.supportMovement} />
      )}
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
