export function toNavigationItem(row) {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    sortOrder: row.sort_order,
  };
}

export function toFooterSection(row, links = []) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary || "",
    content: row.content || {},
    links: links
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((link) => ({ id: link.id, label: link.label, href: link.href })),
  };
}

export function toSocialLink(row) {
  return {
    id: row.id,
    platform: row.platform,
    url: row.url,
    label: row.label || row.platform,
    placement: row.placement,
  };
}
