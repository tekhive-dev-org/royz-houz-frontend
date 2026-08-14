import Head from "next/head";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedTalents } from "@/components/home/FeaturedTalents";
import { OurImpact } from "@/components/home/OurImpact";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { MediaHighlight } from "@/components/home/MediaHighlight";
import { LatestBlog } from "@/components/home/LatestBlog";
import { CommunityCTA } from "@/components/home/CommunityCTA";
import { Testimonials } from "@/components/home/Testimonials";
import { SupportMovement } from "@/components/home/SupportMovement";

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
