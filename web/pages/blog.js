import Head from "next/head";
import { BlogOverview } from "@/components/blog";
import { listBlogCategories, listBlogPosts } from "@/services/content/blogService";
import { getBlogPageSettings } from "@/services/content/blogPageService";

/**
 * Blog Page route (/blog) displaying the hero background carousel, creative pillars,
 * recent articles/podcasts grid, multimedia video stories, and talent CTA banner.
 */
export default function BlogPage({ articles, categories, pageSettings }) {
  const seo = pageSettings?.seo || {};
  const pageTitle = seo.title || "The Royz Houz Journal | Stories, Voices & Ideas That Matter";
  const pageDescription =
    seo.description ||
    "Discover the creatives, performers, and storytellers redefining Africa's creative landscape and creating new possibilities for the world to experience African talent.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:type" content="website" />
      </Head>

      <BlogOverview
        articles={articles}
        categories={categories}
        pageSettings={pageSettings}
      />
    </>
  );
}

export async function getStaticProps() {
  try {
    const [postsResult, categoriesResult, settingsResult] = await Promise.all([
      listBlogPosts(),
      listBlogCategories(),
      getBlogPageSettings(),
    ]);

    const articles =
      postsResult.success && postsResult.data.length > 0
        ? postsResult.data
        : null;

    const categories =
      categoriesResult.success && categoriesResult.data.length > 0
        ? categoriesResult.data
        : null;

    const pageSettings = settingsResult.success ? settingsResult.data : null;

    return { props: { articles, categories, pageSettings }, revalidate: 60 };
  } catch {
    return { props: { articles: null, categories: null, pageSettings: null }, revalidate: 60 };
  }
}
