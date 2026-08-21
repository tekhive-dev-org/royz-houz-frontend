import Head from "next/head";
import { BlogOverview } from "@/components/blog";

/**
 * Blog Page route (/blog) displaying the hero background carousel, creative pillars,
 * recent articles/podcasts grid, multimedia video stories, and talent CTA banner.
 */
export default function BlogPage() {
  return (
    <>
      <Head>
        <title>The Royz Houz Journal | Stories, Voices &amp; Ideas That Matter</title>
        <meta
          name="description"
          content="Discover the creatives, performers, and storytellers redefining Africa's creative landscape and creating new possibilities for the world to experience African talent."
        />
        <meta property="og:title" content="The Royz Houz Journal | Stories, Voices &amp; Ideas" />
        <meta
          property="og:description"
          content="Discover the creatives, performers, and storytellers redefining Africa's creative landscape."
        />
        <meta property="og:type" content="website" />
      </Head>

      <BlogOverview />
    </>
  );
}
