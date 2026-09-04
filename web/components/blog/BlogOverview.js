import { BlogHero } from "./BlogHero/BlogHero";
import { BlogPillars } from "./BlogPillars/BlogPillars";
import { BlogArticles } from "./BlogArticles/BlogArticles";
import { BlogMultimedia } from "./BlogMultimedia/BlogMultimedia";
import { BlogCta } from "./BlogCta/BlogCta";

/**
 * BlogOverview orchestrates the entire Blog & Journal page experience.
 */
export function BlogOverview({ articles, categories, pageSettings }) {
  return (
    <main className="w-full flex flex-col bg-white">
      {/* 1. Hero Section with Background Carousel */}
      <BlogHero hero={pageSettings?.hero} />

      {/* 2. Creative Pillars Section */}
      <BlogPillars pillarsData={pageSettings?.pillars} />

      {/* 3. Recent Articles & Stories Grid */}
      <BlogArticles
        articles={articles || undefined}
        categories={categories || undefined}
        headerData={pageSettings?.articlesHeader}
      />

      {/* 4. Stories Beyond the Page (Multimedia & Video Player) */}
      <BlogMultimedia multimedia={pageSettings?.multimedia} />

      {/* 5. Talent Call to Action */}
      <BlogCta cta={pageSettings?.cta} />
    </main>
  );
}

export default BlogOverview;
