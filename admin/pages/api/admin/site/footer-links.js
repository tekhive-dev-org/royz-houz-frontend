import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { deleteRow, listRows, reorderRows, upsertContentRow } from "@/services/server/contentService";
import { footerLinkSchema, reorderSchema } from "@/validators/site";

export default createAdminCrudHandler("/api/admin/site/footer-links", {
  GET: {
    permission: "settings.read",
    handler: async (req, res) => {
      const { sectionId } = req.query;
      const result = await listRows(null, "footer_links", {
        order: { column: "sort_order" },
        filters: sectionId ? [{ column: "footer_section_id", value: sectionId }] : [],
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: footerLinkSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      let sectionId = input.footerSectionId;
      if (!sectionId) {
        const { data: sections } = await listRows(null, "footer_sections", {
          order: { column: "sort_order" },
          limit: 1,
        });
        if (sections && sections.length > 0) {
          sectionId = sections[0].id;
        } else {
          const secRes = await upsertContentRow(null, {
            table: "footer_sections",
            actorUserId: context.actor.user.id,
            row: { slug: "explore", title: "Explore", sort_order: 0 },
            status: "published",
          });
          if (secRes.success) sectionId = secRes.data.id;
        }
      }

      const { data: maxRows } = await listRows(null, "footer_links", {
        order: { column: "sort_order", ascending: false },
        filters: sectionId ? [{ column: "footer_section_id", value: sectionId }] : [],
        limit: 1,
      });
      const sortOrder = maxRows && maxRows.length > 0 ? (maxRows[0].sort_order + 1) : 0;

      const result = await upsertContentRow(null, {
        table: "footer_links",
        actorUserId: context.actor.user.id,
        row: { footer_section_id: sectionId, label: input.label, href: input.href, sort_order: sortOrder },
        status: input.status,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: footerLinkSchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const updateRow = {
        id: input.id,
        label: input.label,
        href: input.href,
      };
      if (input.footerSectionId) {
        updateRow.footer_section_id = input.footerSectionId;
      }
      if (input.sortOrder !== undefined) {
        updateRow.sort_order = input.sortOrder;
      }

      const result = await upsertContentRow(null, {
        table: "footer_links",
        actorUserId: context.actor.user.id,
        row: updateRow,
        status: input.status,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PATCH: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: reorderSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await reorderRows(null, {
        table: "footer_links",
        ids: input.ids,
        actorUserId: context.actor.user.id,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A record id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await deleteRow(null, { table: "footer_links", id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
