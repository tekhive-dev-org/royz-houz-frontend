import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { buildTalentPreview, getTalent } from "@/services/server/talentsService";

export default createAdminCrudHandler("/api/admin/talents/[id]/preview", {
  GET: {
    permission: "talents.create",
    handler: async (req, res, context) => {
      const { id } = req.query;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A talent id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await getTalent(null, id);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, buildTalentPreview(result.data), { requestId: context.requestId });
    },
  },
});
