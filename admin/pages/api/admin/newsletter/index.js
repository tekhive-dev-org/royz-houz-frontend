import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listNewsletterSubscriptions, updateNewsletterSubscription } from "@/services/server/newsletterService";
import { newsletterListQuerySchema, newsletterUpdateSchema } from "@/validators/newsletter";

export default createAdminCrudHandler("/api/admin/newsletter", {
  GET: {
    permission: "contacts.read",
    handler: async (req, res) => {
      const parsed = newsletterListQuerySchema.safeParse(req.query);
      if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Invalid newsletter filters.", { status: 400 });
      const result = await listNewsletterSubscriptions(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  PUT: {
    permission: "contacts.update",
    handler: async (req, res, context) => {
      const input = validateRequest({ res, schema: newsletterUpdateSchema, input: getJsonBody(req), requestId: context.requestId, logContext: context });
      if (!input) return null;
      const result = await updateNewsletterSubscription(null, { ...input, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
