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
import { TALENT_CATEGORIES, TALENT_DIRECTORY_ITEMS, TRENDING_TALENTS } from "@/constants/talents";
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
    const talents = result.success ? result.data : TALENT_DIRECTORY_ITEMS;
    const trendingTalents = trendingResult.success ? trendingResult.data : TRENDING_TALENTS;
    const categories = categoriesResult.success
      ? [{ id: "all", label: "All" }, ...categoriesResult.data]
      : TALENT_CATEGORIES;

    return {
      props: { talents, trendingTalents, categories },
      revalidate: 60,
    };
  } catch {
    return {
      props: { talents: TALENT_DIRECTORY_ITEMS, trendingTalents: TRENDING_TALENTS, categories: TALENT_CATEGORIES },
      revalidate: 60,
    };
  }
}


