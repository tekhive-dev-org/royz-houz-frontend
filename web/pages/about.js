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
import { isAboutSectionVisible } from "@/adapters/aboutAdapter";
import { getAboutContent } from "@/services/content/aboutService";

export default function AboutPage({ content = {} }) {
  return (
    <>
      <Head>
        <title>About Us | RoyzHouz</title>
        <meta
          name="description"
          content="A movement born from passion, driven by purpose. We discover, develop, and empower Africa's next generation of creatives."
        />
      </Head>

      {isAboutSectionVisible(content, "hero") && <AboutHero content={content.hero} />}
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
      {isAboutSectionVisible(content, "story") && <AboutStory content={content.story} />}
      {isAboutSectionVisible(content, "whyChooseUs") && (
        <WhyChooseUs
          content={content.whyChooseUs}
          cards={content.whyChooseUs?.cards}
          metrics={content.whyChooseUs?.metrics}
        />
      )}
      {isAboutSectionVisible(content, "moments") && (
        <Moments content={content.moments} features={content.moments?.features} />
      )}
      {isAboutSectionVisible(content, "gallery") && (
        <Gallery content={content.gallery} columns={content.gallery?.columns} />
      )}
      {isAboutSectionVisible(content, "testimonials") && <Testimonials content={content.testimonials} />}
    </>
  );
}

export async function getStaticProps() {
  try {
    const result = await getAboutContent();
    const data = result.success ? { ...result.data } : {};
    if (data.whyChooseUs?.cards) {
      data.whyChooseUs = {
        ...data.whyChooseUs,
        cards: data.whyChooseUs.cards.map((c) => {
          const { icon: _omitted, ...rest } = c;
          return {
            ...rest,
            iconKey: rest.iconKey || rest.id || "mission",
          };
        }),
      };
    }
    return {
      props: { content: data },
      revalidate: 60,
    };
  } catch {
    // Section components retain their existing constants until dynamic content
    // is available, preventing a failed CMS request from changing the layout.
    return { props: { content: {} }, revalidate: 60 };
  }
}
