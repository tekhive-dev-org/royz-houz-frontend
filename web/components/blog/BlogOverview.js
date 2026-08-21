import { BlogHero } from "./BlogHero/BlogHero";
import { BlogPillars } from "./BlogPillars/BlogPillars";
import { BlogArticles } from "./BlogArticles/BlogArticles";
import { BlogMultimedia } from "./BlogMultimedia/BlogMultimedia";
import { BlogCta } from "./BlogCta/BlogCta";

/**
 * BlogOverview orchestrates the entire Blog & Journal page experience.
 */
export function BlogOverview() {
  return (
    <main className="w-full flex flex-col bg-white">
      {/* 1. Hero Section with Background Carousel */}
      <BlogHero />

      {/* 2. Creative Pillars Section */}
      <BlogPillars />

      {/* 3. Recent Articles & Stories Grid */}
      <BlogArticles />

      {/* 4. Stories Beyond the Page (Multimedia & Video Player) */}
      <BlogMultimedia />

      {/* 5. Talent Call to Action */}
      <BlogCta />
    </main>
  );
}

export default BlogOverview;
