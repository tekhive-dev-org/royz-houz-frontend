export function toSeoMetadata(row) {
  return {
    title: row.title || "",
    description: row.summary || "",
    canonicalPath: row.canonical_path || "",
    ogTitle: row.og_title || row.title || "",
    ogDescription: row.og_description || row.summary || "",
    ogImageUrl: row.og_image_url || "",
    noIndex: row.no_index,
    noFollow: row.no_follow || false,
    structuredData: row.structured_data || null,
  };
}
