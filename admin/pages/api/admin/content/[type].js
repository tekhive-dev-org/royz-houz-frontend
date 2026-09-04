import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { buildSectionPreview, deleteSection, listSections, reorderSections, saveSection } from "@/services/server/sectionsService";
import { reorderSectionsSchema, sectionSchema } from "@/validators/sections";

const TABLES = { homepage: "homepage_sections", about: "about_sections" };
const PERMISSIONS = { homepage: { read: "homepage.read", write: "homepage.update" }, about: { read: "homepage.read", write: "homepage.update" } };

function resolveTable(type) {
  return TABLES[type] || null;
}

export default function handler(req, res) {
  const { type } = req.query;
  const table = resolveTable(type);
  if (!table) {
    return sendError(res, "VALIDATION_ERROR", "A valid content type is required.", { status: 400 });
  }

  const readPermission = PERMISSIONS[type].read;
  const writePermission = PERMISSIONS[type].write;

  return createAdminCrudHandler(`/api/admin/content/${type}`, {
    GET: {
      permission: readPermission,
      handler: async (req, res) => {
        const { includePreview } = req.query;
        const result = await listSections(null, table);
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
        const data = includePreview === "true" ? buildSectionPreview(result.data) : result.data;
        return sendSuccess(res, data);
      },
    },
    POST: {
      permission: writePermission,
      handler: async (req, res, context) => {
        const input = validateRequest({
          res,
          schema: sectionSchema,
          input: getJsonBody(req),
          requestId: context.requestId,
          logContext: context,
        });
        if (!input) return null;

        const result = await saveSection(null, { table, actorUserId: context.actor.user.id, section: input });
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
      },
    },
    PUT: {
      permission: writePermission,
      handler: async (req, res, context) => {
        const input = validateRequest({
          res,
          schema: sectionSchema.extend({ id: z.string().uuid() }),
          input: getJsonBody(req),
          requestId: context.requestId,
          logContext: context,
        });
        if (!input) return null;

        const result = await saveSection(null, { table, actorUserId: context.actor.user.id, section: input });
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { requestId: context.requestId });
      },
    },
    PATCH: {
      permission: writePermission,
      handler: async (req, res, context) => {
        const input = validateRequest({
          res,
          schema: reorderSectionsSchema,
          input: getJsonBody(req),
          requestId: context.requestId,
          logContext: context,
        });
        if (!input) return null;

        const result = await reorderSections(null, { table, ids: input.ids, actorUserId: context.actor.user.id });
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { requestId: context.requestId });
      },
    },
    DELETE: {
      permission: writePermission,
      handler: async (req, res, context) => {
        const id = req.query.id;
        if (typeof id !== "string" || !id) {
          return sendError(res, "VALIDATION_ERROR", "A section id is required.", { status: 400, requestId: context.requestId });
        }
        const result = await deleteSection(null, { table, id, actorUserId: context.actor.user.id });
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { requestId: context.requestId });
      },
    },
  })(req, res);
}
