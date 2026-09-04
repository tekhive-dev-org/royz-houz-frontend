import { createPaginationMeta } from "@/utils/pagination";

function toRepositoryError(_error, context) {
  return {
    success: false,
    error: {
      code: "CONTENT_QUERY_FAILED",
      message: `Unable to load ${context}.`,
    },
  };
}

/**
 * Shared RLS-respecting repository for public content views/tables.
 * Callers provide a server-side anonymous client and an adapter in the service
 * layer; presentation components never query Supabase directly.
 */
export async function listPublicRecords(
  client,
  { source, select = "*", pagination, order, filters = [], search }
) {
  let query = client.from(source).select(select, { count: "exact" });

  for (const filter of filters) {
    query = query.filter(filter.column, filter.operator || "eq", filter.value);
  }

  if (search?.value && search.columns?.length) {
    const expression = search.columns
      .map((column) => `${column}.ilike.%${search.value}%`)
      .join(",");
    query = query.or(expression);
  }

  if (order) {
    query = query.order(order.column, {
      ascending: order.ascending ?? true,
      nullsFirst: order.nullsFirst ?? false,
    });
  }

  if (pagination) {
    query = query.range(pagination.from, pagination.to);
  }

  const { data, error, count } = await query;
  if (error) return toRepositoryError(error, source);

  return {
    success: true,
    data: data || [],
    pagination: pagination
      ? createPaginationMeta({ page: pagination.page, limit: pagination.limit, total: count || 0 })
      : null,
  };
}

export async function getPublicRecordBySlug(client, { source, slug, select = "*" }) {
  const { data, error } = await client.from(source).select(select).eq("slug", slug).maybeSingle();

  if (error) return toRepositoryError(error, source);
  if (!data) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Content was not found." },
    };
  }

  return { success: true, data };
}

export async function callPublicRpc(client, functionName, params) {
  const { data, error } = await client.rpc(functionName, params);
  if (error) {
    return {
      success: false,
      error: {
        code: "SUBMISSION_FAILED",
        message: "Unable to submit your request. Please review the form and try again.",
      },
    };
  }

  return { success: true, data };
}
