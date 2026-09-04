import { getBody } from "./contentAdapter.js";
import { formatDate } from "../utils/dateFormatter.js";

const BLOG_IMAGE_FALLBACK = "/assets/img/blog/post-ballet.jpg";

export function toBlogAuthor(row) {
  if (!row) return null;
  const body = getBody(row);
  return {
    id: row.id,
    slug: row.slug,
    name: row.title || body.name || "Chisom Obi",
    role: body.role || "STAFF WRITER",
    bio:
      row.summary ||
      body.bio ||
      "Chisom is an essayist, journalist, and creative strategist at Royz Houz focusing on contemporary African music, dance, film, and youth empowerment. Her work has appeared in leading global publications.",
    avatar: body.avatar || "/assets/img/blog/author-chisom.jpg",
  };
}

export function toBlogArticle(row, author = null) {
  const body = getBody(row);
  const rawDate = body.displayDate || row.published_at || body.date || "";
  const resolvedAuthor = author ? toBlogAuthor(author) : (body.authorData ? body.authorData : null);
  const authorOverride = typeof body.author === "string" && body.author.trim() ? body.author.trim() : null;
  const authorName = authorOverride || resolvedAuthor?.name || author?.title || "Royz Houz Editorial";

  return {
    ...body,
    id: row.id || body.id,
    slug: row.slug,
    title: row.title,
    badge: body.badge || "",
    format: body.format || "",
    readTime: body.readTime || "",
    date: formatDate(rawDate) || rawDate,
    author: authorName,
    authorData: resolvedAuthor,
    authorId: row.blog_author_id || body.authorId || null,
    image: body.image || BLOG_IMAGE_FALLBACK,
    excerpt: row.summary || body.excerpt || "",
    category: body.category || "",
    content: Array.isArray(body.content) ? body.content : [],
  };
}

export function toBlogCategory(row) {
  return { id: row.slug, label: row.title };
}
