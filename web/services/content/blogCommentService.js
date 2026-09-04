import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { callPublicRpc } from "@/repositories/publicContentRepository";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

function toPublicComment(comment) {
  return {
    id: comment.id,
    parentCommentId: comment.parent_comment_id || null,
    author: comment.author_name || "Guest Reader",
    content: comment.body || "",
    date: comment.published_at || comment.created_at || "",
    order: comment.created_at || comment.published_at || "",
    avatar: null,
    baseLikes: 0,
    replies: [],
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveBlogPostUuid(client, identifier) {
  if (!identifier || typeof identifier !== "string") return null;
  if (UUID_REGEX.test(identifier)) return identifier;

  const { data, error } = await client
    .from("blog_posts")
    .select("id")
    .eq("slug", identifier)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id;
}

export async function listPublishedBlogComments(postId, { client } = {}) {
  const supabase = getContentClient(client);
  const resolvedPostId = await resolveBlogPostUuid(supabase, postId);
  if (!resolvedPostId) {
    return serviceSuccess([], "Comments loaded successfully");
  }

  const result = await callPublicRpc(supabase, "get_published_blog_comments", {
    p_blog_post_id: resolvedPostId,
  });
  if (!result.success) return serviceFailure(result.error);

  const commentsById = new Map((result.data || []).map((comment) => [comment.id, toPublicComment(comment)]));
  const topLevelComments = [];

  for (const comment of commentsById.values()) {
    const parent = comment.parentCommentId && commentsById.get(comment.parentCommentId);
    if (parent) parent.replies.push(comment);
    else topLevelComments.push(comment);
  }

  return serviceSuccess(topLevelComments, "Comments loaded successfully");
}

export async function submitBlogComment(input, { client } = {}) {
  const supabase = client || createSupabaseServiceRoleClient();
  const resolvedPostId = await resolveBlogPostUuid(supabase, input.postId);
  if (!resolvedPostId) {
    return serviceFailure({
      code: "NOT_FOUND",
      message: "The requested article was not found.",
    });
  }

  const result = await callPublicRpc(supabase, "submit_blog_comment", {
    p_blog_post_id: resolvedPostId,
    p_parent_comment_id: input.parentCommentId || null,
    p_author_name: input.authorName,
    p_author_email: input.authorEmail,
    p_body: input.body,
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(
    { id: result.data },
    "Your comment has been submitted for moderation."
  );
}
