import { createAdminCrudHandler } from "@/utils/crudHandler";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { getTicketPayment } from "@/services/server/paymentsService";

export default createAdminCrudHandler("/api/admin/payments/[id]", {
  GET: {
    permission: "events.create",
    handler: async (req, res) => {
      const result = await getTicketPayment(null, req.query.id);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: result.error.code === "NOT_FOUND" ? 404 : 400 });
      return sendSuccess(res, result.data);
    },
  },
});
