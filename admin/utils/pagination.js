export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

/** Parses and clamps page/limit from a query object or parsed Zod value. */
export function normalizePagination(input = {}) {
  const rawPage = input.page;
  const rawLimit = input.limit;
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

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
