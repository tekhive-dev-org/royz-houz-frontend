import Head from "next/head";
import { TalentApplication } from "@/components/talents";

export default function JoinTalentApplicationPage() {
  return (
    <>
      <Head>
        <title>Apply as a Talent | Join the Royz Houz Family</title>
        <meta
          name="description"
          content="Apply to join the Royz Houz talent roster. Share your skills, portfolio, social platforms, and booking preferences."
        />
        <meta property="og:title" content="Apply as a Talent | Royz Houz" />
        <meta
          property="og:description"
          content="Are you a talented individual? Join the Royz Houz family and build your creative future."
        />
      </Head>

      <main>
        <TalentApplication />
      </main>
    </>
  );
}
