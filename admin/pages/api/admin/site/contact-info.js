import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { z } from "zod";
import { contactInfoSchema } from "@/validators/site";
import { readSingletonSetting, upsertSingletonSetting } from "@/services/server/singletonSettingService";
import { writeSuccessfulAdminMutationAudit } from "@/services/server/adminAuthorizationService";

const contactUpdateSchema = contactInfoSchema.extend({
  status: z.enum(["draft", "published"]).default("draft"),
});

export default createAdminCrudHandler("/api/admin/site/contact-info", {
  GET: {
    permission: "settings.read",
    handler: async (_req, res) => {
      const result = await readSingletonSetting("contact-info");
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  PUT: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: contactUpdateSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertSingletonSetting(
        "contact-info",
        "Contact Information",
        { address: input.address, email: input.email, phone: input.phone, website: input.website },
        input.status
      );
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });

      await writeSuccessfulAdminMutationAudit(
        {
          actorUserId: context.actor.user.id,
          action: "site_settings.update_contact_info",
          entityType: "site_settings",
          entityId: result.data.id,
          newValues: { status: input.status },
        },
        { client: undefined }
      );

      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
