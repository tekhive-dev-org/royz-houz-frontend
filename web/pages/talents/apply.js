import Head from "next/head";
import { TalentApplication } from "@/components/talents";

export default function TalentsApplyPage() {
  return (
    <>
      <Head>
        <title>Apply as a Talent | Royz Houz Talent Hub</title>
        <meta
          name="description"
          content="Apply to join the Royz Houz talent roster. Share your skills, portfolio, social platforms, and booking preferences."
        />
      </Head>

      <main>
        <TalentApplication />
      </main>
    </>
  );
}
