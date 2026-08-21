import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { BLOG_ARTICLES, BLOG_HERO_SLIDES } from "@/constants/blog";
import { ArticleHeader } from "@/components/blog/ArticleDetail/ArticleHeader/ArticleHeader";
import { ArticleBody } from "@/components/blog/ArticleDetail/ArticleBody/ArticleBody";
import { ArticleAuthorCard } from "@/components/blog/ArticleDetail/ArticleAuthorCard/ArticleAuthorCard";
import { ArticleCommentForm } from "@/components/blog/ArticleDetail/ArticleCommentForm/ArticleCommentForm";
import { ArticleComments } from "@/components/blog/ArticleDetail/ArticleComments/ArticleComments";
import { ArticleRelated } from "@/components/blog/ArticleDetail/ArticleRelated/ArticleRelated";

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [userComments, setUserComments] = useState([]);

  // Find article matching slug or default to first
  const article =
    BLOG_ARTICLES.find((a) => a.slug === slug) ||
    BLOG_HERO_SLIDES.find((s) => s.ctaLink === `/blog/${slug}`) ||
    BLOG_ARTICLES[0];

  const handleAddComment = (newComment) => {
    setUserComments((prev) => [
      {
        id: `user-${Date.now()}`,
        author: newComment.author || "Guest Reader",
        isCurrentUser: true,
        avatar: null,
        date: "Just now",
        content: newComment.content,
        likes: 0,
        baseLikes: 0,
        hasLiked: false,
        order: 0,
        replies: [],
      },
      ...prev,
    ]);
  };

  const handleDeleteComment = (id) => {
    setUserComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEditComment = (id, newContent) => {
    setUserComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: newContent } : c))
    );
  };

  const pageTitle = `${article.title || `${article.titlePrefix} ${article.titleHighlight}`} | Royz Houz Journal`;
  const pageDescription = article.excerpt || article.description;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={article.image || "/assets/img/blog/post-ballet.jpg"} />
      </Head>

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-10 sm:gap-14">
          {/* Article Header (Breadcrumb, Cover Image, Title, Meta, Share) */}
          <ArticleHeader article={article} />

          {/* 2-Column Content + Sticky Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Main Article Column */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <ArticleBody />
              <ArticleCommentForm onAddComment={handleAddComment} />
              <ArticleComments
                newComments={userComments}
                onDeleteComment={handleDeleteComment}
                onEditComment={handleEditComment}
              />
            </div>

            {/* Right Sticky Author Column */}
            <div className="lg:col-span-4">
              <ArticleAuthorCard author={article.author || "Chisom Obi"} />
            </div>
          </div>

          {/* You Might Also Like Section */}
          <ArticleRelated currentSlug={article.slug} />
        </div>
      </main>
    </>
  );
}
