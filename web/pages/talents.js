import { useState } from "react";
import Head from "next/head";
import {
  TalentHero,
  TrendingTalents,
  TalentDirectory,
  TalentCTA,
} from "@/components/talents";
import { Breadcrumb } from "@/components/common";
import { Testimonials } from "@/components/home";

import { getTrendingTalents, listTalentCategories, listTalents } from "@/services/content/talentService";

export default function TalentsPage({ talents, trendingTalents, categories }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Smooth scroll down to the directory section when searching
    if (typeof window !== "undefined") {
      const element = document.getElementById("talent-directory");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
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
      <TrendingTalents talents={trendingTalents} />

      {/* Talent Hub Catalog & Directory Section */}
      <TalentDirectory talents={talents} searchQuery={searchQuery} categories={categories} />

      {/* Talent Call to Action Section */}
      <TalentCTA />
      <Testimonials />
    </>
  );
}

export async function getStaticProps() {
  try {
    const [result, trendingResult, categoriesResult] = await Promise.all([
      listTalents(),
      getTrendingTalents({ limit: 4 }),
      listTalentCategories(),
    ]);
    const talents = result.success ? result.data : [];
    const talentsBySlug = new Map(talents.map((talent) => [talent.slug, talent]));
    const trendingTalents = trendingResult.success
      ? trendingResult.data.map((talent) => {
          const directoryTalent = talentsBySlug.get(talent.slug);
          return directoryTalent
            ? { ...talent, image: directoryTalent.image, alt: directoryTalent.alt || talent.alt }
            : talent;
        })
      : [];
    const categories = categoriesResult.success
      ? [{ id: "all", label: "All" }, ...categoriesResult.data]
      : [{ id: "all", label: "All" }];

    return {
      props: { talents, trendingTalents, categories },
      revalidate: 60,
    };
  } catch {
    return {
      props: { talents: [], trendingTalents: [], categories: [{ id: "all", label: "All" }] },
      revalidate: 60,
    };
  }
}


