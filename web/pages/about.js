import Head from "next/head";
import { AboutHero } from "@/components/about/AboutHero";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { AboutStory } from "@/components/about/AboutStory";
import { WhyChooseUs } from "@/components/about/WhyChooseUs";
import { Moments } from "@/components/about/Moments";
import { Gallery } from "@/components/about/Gallery";
import { Testimonials } from "@/components/home/Testimonials";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | RoyzHouz</title>
        <meta
          name="description"
          content="A movement born from passion, driven by purpose. We discover, develop, and empower Africa's next generation of creatives."
        />
      </Head>

      <AboutHero />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
      <AboutStory />
      <WhyChooseUs />
      <Moments />
      <Gallery />
      <Testimonials />
    </>
  );
}
