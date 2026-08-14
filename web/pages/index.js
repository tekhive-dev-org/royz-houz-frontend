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

export default function Home() {
  return (
    <>
      <Head>
        <title>RoyzHouz | Building Africa&apos;s Next Generation</title>
        <meta
          name="description"
          content="Building Africa's next generation of creatives, leaders & innovators."
        />
        
      </Head>

      <HeroSection />
      <FeaturedTalents />
      <OurImpact />
      <UpcomingEvents />
      <MediaHighlight />
      <LatestBlog />
      <CommunityCTA />
      <Testimonials />
      <SupportMovement />
    </>
  );
}
