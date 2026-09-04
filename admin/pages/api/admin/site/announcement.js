import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { z } from "zod";
import { announcementSchema } from "@/validators/site";
import { readSingletonSetting, upsertSingletonSetting } from "@/services/server/singletonSettingService";
import { writeSuccessfulAdminMutationAudit } from "@/services/server/adminAuthorizationService";

const announcementUpdateSchema = announcementSchema.extend({
  status: z.enum(["draft", "published"]).default("draft"),
});

export default createAdminCrudHandler("/api/admin/site/announcement", {
  GET: {
    permission: "settings.read",
    handler: async (_req, res) => {
      const result = await readSingletonSetting("site-announcement");
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  PUT: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: announcementUpdateSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertSingletonSetting(
        "site-announcement",
        "Site Announcement",
        { message: input.message, enabled: input.enabled, link: input.link || null },
        input.status
      );
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });

      await writeSuccessfulAdminMutationAudit(
        {
          actorUserId: context.actor.user.id,
          action: "site_settings.update_announcement",
          entityType: "site_settings",
          entityId: result.data.id,
          newValues: { status: input.status, enabled: input.enabled },
        },
        { client: undefined }
      );

      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
