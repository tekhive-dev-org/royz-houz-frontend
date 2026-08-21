import Head from "next/head";
import {
  ContactHero,
  ContactInfo,
  ContactMap,
  ContactFAQ,
  ContactCTA,
} from "@/components/contact";

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us | RoyzHouz</title>
        <meta
          name="description"
          content="Get in touch with Royz Houz. Whether you're a creative, partner, or fan, we'd love to hear from you. Send us a message, call, or visit our headquarters in Lagos."
        />
        <meta property="og:title" content="Contact Us | RoyzHouz" />
        <meta
          property="og:description"
          content="Reach out to Royz Houz for partnerships, talent inquiries, events, and more."
        />
      </Head>

      <main className="min-h-screen bg-white">
        <ContactHero />
        <ContactInfo />
        <ContactMap />
        <ContactFAQ />
        <ContactCTA />
      </main>
    </>
  );
}
