import { listSelectableMedia } from "@/services/server/mediaSelectionService";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";

export default createAdminCrudHandler("/api/admin/media", {
  GET: {
    permission: "media.upload",
    handler: async (req, res) => {
      const { type, search } = req.query;
      const result = await listSelectableMedia({
        type: typeof type === "string" && type ? type : undefined,
        search: typeof search === "string" && search ? search : undefined,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
});
