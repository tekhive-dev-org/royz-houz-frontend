export function getBody(row) {
  return row?.body && typeof row.body === "object" ? row.body : {};
}

export function toContentStatus(row) {
  return {
    status: row.status,
    publishedAt: row.published_at || null,
    scheduledAt: row.scheduled_at || null,
  };
}

export function toSiteSetting(row) {
  const content = row?.content && typeof row.content === "object" ? row.content : {};
  return {
    ...content,
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    featured: row.featured,
    sortOrder: row.sort_order,
    ...toContentStatus(row),
  };
}

export function toSection(row) {
  return {
    ...getBody(row),
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    featured: row.featured,
    sortOrder: row.sort_order,
    ...toContentStatus(row),
  };
}
