import Head from "next/head";
import { ArticleHeader } from "@/components/blog/ArticleDetail/ArticleHeader/ArticleHeader";
import { ArticleBody } from "@/components/blog/ArticleDetail/ArticleBody/ArticleBody";
import { ArticleAuthorCard } from "@/components/blog/ArticleDetail/ArticleAuthorCard/ArticleAuthorCard";
import { ArticleCommentForm } from "@/components/blog/ArticleDetail/ArticleCommentForm/ArticleCommentForm";
import { ArticleComments } from "@/components/blog/ArticleDetail/ArticleComments/ArticleComments";
import { ArticleRelated } from "@/components/blog/ArticleDetail/ArticleRelated/ArticleRelated";
import { listPublishedBlogComments } from "@/services/content/blogCommentService";
import { getBlogPostBySlug, listBlogPosts } from "@/services/content/blogService";

export default function BlogPostPage({ article, comments, relatedArticles }) {
  const pageTitle = `${article.title} | Royz Houz Journal`;
  const pageDescription = article.excerpt;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {article.image && <meta property="og:image" content={article.image} />}
      </Head>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-10 sm:gap-14">
          <ArticleHeader article={article} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <ArticleBody article={article} />
              <ArticleCommentForm postId={article.id} />
              <ArticleComments comments={comments} />
            </div>

            <div className="lg:col-span-4">
              <ArticleAuthorCard author={article.authorData || article.author || "Chisom Obi"} />
            </div>
          </div>

          <ArticleRelated currentSlug={article.slug} articles={relatedArticles || undefined} />
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  try {
    const result = await listBlogPosts();
    return {
      paths: result.success ? result.data.map((article) => ({ params: { slug: article.slug } })) : [],
      fallback: "blocking",
    };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;
  if (!slug || Array.isArray(slug)) return { notFound: true, revalidate: 60 };

  try {
    const postResult = await getBlogPostBySlug(slug);
    if (!postResult.success || !postResult.data) return { notFound: true, revalidate: 60 };

    const [commentsResult, postsResult] = await Promise.all([
      listPublishedBlogComments(postResult.data.id),
      listBlogPosts(),
    ]);

    const relatedArticles =
      postsResult.success && postsResult.data.length > 0
        ? postsResult.data.filter((post) => post.slug !== postResult.data.slug).slice(0, 3)
        : null;

    return {
      props: {
        article: postResult.data,
        comments: commentsResult.success ? commentsResult.data : [],
        relatedArticles,
      },
      revalidate: 60,
    };
  } catch {
    return { notFound: true, revalidate: 60 };
  }
}
