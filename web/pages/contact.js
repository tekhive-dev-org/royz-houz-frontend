import Head from "next/head";
import {
  ContactHero,
  ContactInfo,
  ContactMap,
  ContactFAQ,
  ContactCTA,
} from "@/components/contact";
import { getContactPageSettings } from "@/services/content/contactPageService";

export default function ContactPage({ pageSettings = null }) {
  const seoTitle = pageSettings?.seo?.title || "Contact Us | RoyzHouz";
  const seoDescription =
    pageSettings?.seo?.description ||
    "Get in touch with Royz Houz. Whether you're a creative, partner, or fan, we'd love to hear from you. Send us a message, call, or visit our headquarters in Lagos.";
  const seoOgImage = pageSettings?.seo?.ogImage || "/assets/img/contact-hero.png";

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={seoOgImage} />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen bg-white">
        <ContactHero hero={pageSettings?.hero} />
        <ContactInfo info={pageSettings?.info} />
        <ContactMap map={pageSettings?.map} />
        <ContactFAQ faq={pageSettings?.faq} />
        <ContactCTA cta={pageSettings?.cta} />
      </main>
    </>
  );
}

export async function getStaticProps() {
  try {
    const result = await getContactPageSettings();
    return {
      props: {
        pageSettings: result.success ? result.data : null,
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        pageSettings: null,
      },
      revalidate: 60,
    };
  }
}
