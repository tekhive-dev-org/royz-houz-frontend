export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

export function parsePagination(query = {}) {
  const pageValue = Number.parseInt(query.page, 10);
  const limitValue = Number.parseInt(query.limit, 10);
  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit =
    Number.isFinite(limitValue) && limitValue > 0
      ? Math.min(limitValue, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return {
    page,
    limit,
    from: (page - 1) * limit,
    to: page * limit - 1,
  };
}

export function createPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
