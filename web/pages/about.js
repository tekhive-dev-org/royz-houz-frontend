import Head from "next/head";
import {
  AboutHero,
  AboutStory,
  WhyChooseUs,
  Moments,
  Gallery,
} from "@/components/about";
import { Breadcrumb } from "@/components/common";
import { Testimonials } from "@/components/home";

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
