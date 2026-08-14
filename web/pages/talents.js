import Head from "next/head";
import { TalentHero } from "@/components/talents/TalentHero";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { TrendingTalents } from "@/components/talents/TrendingTalents";

export default function TalentsPage() {
  const handleSearch = (_query) => {
    // Will connect to directory filtering state
  };

  return (
    <>
      <Head>
        <title>Talent Hub | RoyzHouz</title>
        <meta
          name="description"
          content="Building Africa's next generation of creatives, leaders & innovators. Discover and connect with exceptional African creative talents."
        />
      </Head>

      {/* Hero Section */}
      <TalentHero onSearch={handleSearch} />

      {/* Shared Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Talents" },
        ]}
      />

      {/* Trending Now Section */}
      <TrendingTalents />
    </>
  );
}
