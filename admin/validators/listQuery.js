import { z } from "zod";
import { booleanQuerySchema, paginationSchema, searchSchema, statusSchema } from "./common";

/**
 * Builds a reusable list-query schema with pagination, search, optional status
 * and featured filters, and constrained sorting.
 *
 * @param {{sortable: string[], filterable?: string[]}} options
 */
export function createListQuerySchema({ sortable = [], filterable = [] } = {}) {
  const base = paginationSchema.extend({
    search: searchSchema,
    status: statusSchema.optional(),
    featured: booleanQuerySchema,
    sortBy: z.string().trim().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
  });

  const filterFieldSchema = z.record(z.string()).optional();
  const filterSchema = z
    .object({
      field: z.string().trim().optional(),
      value: z.string().trim().max(160).optional(),
    })
    .array()
    .optional();

  return base.extend({
    filters: filterSchema,
    filterFields: filterFieldSchema,
    sortable: z.array(z.string()).optional(),
  }).superRefine((value, context) => {
    if (value.sortBy && sortable.length && !sortable.includes(value.sortBy)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sortBy"],
        message: `sortBy must be one of: ${sortable.join(", ")}.`,
      });
    }

    for (const filter of value.filters || []) {
      if (filter.field && filterable.length && !filterable.includes(filter.field)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["filters"],
          message: `Filter field must be one of: ${filterable.join(", ")}.`,
        });
      }
    }
  });
}
