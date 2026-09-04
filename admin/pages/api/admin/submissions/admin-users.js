import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listAdminUsers } from "@/services/server/submissionsService";

export default createAdminCrudHandler("/api/admin/submissions/admin-users", {
  GET: {
    permission: "contacts.read",
    handler: async (_req, res) => {
      const result = await listAdminUsers(null);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
});
