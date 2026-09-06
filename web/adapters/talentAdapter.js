import { getBody } from "./contentAdapter.js";

const TALENT_IMAGE_FALLBACK = "/assets/img/talents/julius.jpg";
const TALENT_COVER_IMAGE_FALLBACK = "/assets/img/talents/producer-hero.jpg";

function getCategoryAssignments(row) {
  const assignments = Array.isArray(row.talent_category_assignments)
    ? row.talent_category_assignments
    : Array.isArray(row.categoryAssignments)
      ? row.categoryAssignments
      : [];

  return assignments
    .map((assignment, index) => {
      const category = assignment.talent_categories || assignment.category;
      const id = assignment.talent_category_id || assignment.categoryId || category?.id;
      if (!category || !id) return null;

      return {
        id,
        title: category.title || "",
        slug: category.slug || "",
        isPrimary: Boolean(assignment.is_primary ?? assignment.isPrimary),
        sortOrder: assignment.sort_order ?? assignment.sortOrder ?? index,
        index,
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.index - right.index);
}

export function toTalentDirectoryItem(row) {
  const body = getBody(row);
  const publicBody = { ...body };
  delete publicBody.galleryMediaRefs;
  const hasJoinedCategories = Array.isArray(row.talent_category_assignments) || Array.isArray(row.categoryAssignments);
  const categoryAssignments = getCategoryAssignments(row);
  const primaryCategory = categoryAssignments.find((assignment) => assignment.isPrimary) || categoryAssignments[0];

  return {
    ...publicBody,
    id: body.id || row.id,
    slug: row.slug || "",
    name: body.name || row.title || row.name || "",
    category: primaryCategory?.title || (!hasJoinedCategories ? body.category : "") || "",
    categoryKey: primaryCategory?.slug || (!hasJoinedCategories ? body.categoryKey : "") || "",
    categoryIds: hasJoinedCategories
      ? categoryAssignments.map((assignment) => assignment.id)
      : body.categoryIds || row.categoryIds || [],
    primaryCategoryId: hasJoinedCategories
      ? primaryCategory?.id || null
      : body.primaryCategoryId || row.primaryCategoryId || null,
    subtitle: body.subtitle || row.summary || "",
    bio: body.bio || row.summary || "",
    location: row.location || body.location || "",
    image: body.image || body.avatar || body.profileImage || body.profile_image || TALENT_IMAGE_FALLBACK,
    coverImage: body.coverImage || body.cover_image || body.image || body.avatar || body.profileImage || TALENT_COVER_IMAGE_FALLBACK,

    isHot: Boolean(body.isHot),
  };
}

export function toFeaturedTalent(row) {
  const talent = toTalentDirectoryItem(row);
  return {
    id: talent.id,
    slug: talent.slug,
    name: talent.name,
    category: talent.category || "",
    genre: talent.genre || "",
    location: talent.location || "",
    rating: talent.rating || 0,
    followers: talent.followers || "",
    image: talent.image || "",
    isHot: talent.isHot,
  };
}

export function toTrendingTalent(row) {
  const talent = toTalentDirectoryItem(row);
  return {
    id: talent.id,
    slug: talent.slug,
    name: talent.name,
    profession: talent.profession || talent.category || "",
    image: talent.image || "",
    alt: talent.alt || talent.name,
  };
}

export function toTalentCategory(row) {
  return { id: row.slug, label: row.title };
}
