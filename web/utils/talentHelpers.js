import { TALENT_DIRECTORY_ITEMS } from "@/constants/talents";

/**
 * Retrieve talent by slug or id from directory items
 * @param {string} slug - The slug or id of the talent
 * @returns {object|null} The matching talent object or default fallback
 */
export function getTalentBySlug(slug) {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase().trim();
  return (
    TALENT_DIRECTORY_ITEMS.find(
      (item) =>
        item.slug.toLowerCase() === normalized ||
        item.id.toLowerCase() === normalized
    ) || TALENT_DIRECTORY_ITEMS[0]
  );
}

/**
 * Get related talents strictly from the same category
 * @param {string} categoryKey - The category key or category name
 * @param {string} currentId - Current talent id to exclude
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} List of matching peer talent objects
 */
export function getRelatedTalents(categoryKey, currentId, limit = 3) {
  if (!categoryKey) return [];
  const normalizedCat = String(categoryKey).toLowerCase().trim();

  // Strictly filter items belonging to the same category
  const sameCategoryItems = TALENT_DIRECTORY_ITEMS.filter((item) => {
    const itemCatKey = (item.categoryKey || "").toLowerCase().trim();
    const itemCat = (item.category || "").toLowerCase().trim();
    const isMatch =
      itemCatKey === normalizedCat ||
      itemCat === normalizedCat ||
      itemCatKey.includes(normalizedCat) ||
      normalizedCat.includes(itemCatKey);
    const isDifferent =
      item.id !== currentId && item.slug !== currentId;
    return isMatch && isDifferent;
  });

  return sameCategoryItems.slice(0, limit);
}
