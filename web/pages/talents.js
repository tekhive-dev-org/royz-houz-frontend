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

export default function TalentsPage() {
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
      <TrendingTalents />

      {/* Talent Hub Catalog & Directory Section */}
      <TalentDirectory searchQuery={searchQuery} />

      {/* Talent Call to Action Section */}
      <TalentCTA />
      <Testimonials />
    </>
  );
}

