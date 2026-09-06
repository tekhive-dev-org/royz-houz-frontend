import { createAdminCrudHandler } from "@/utils/crudHandler";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { listTicketPayments } from "@/services/server/paymentsService";

export default createAdminCrudHandler("/api/admin/payments", {
  GET: {
    permission: "events.create",
    handler: async (req, res) => {
      const result = await listTicketPayments(null, req.query);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data, { meta: { pagination: result.pagination } });
    },
  },
});
