import { createAdminCrudHandler } from "@/utils/crudHandler";
import { sendError } from "@/utils/apiResponse";
import { exportTicketPayments } from "@/services/server/paymentsService";

export default createAdminCrudHandler("/api/admin/payments/export", {
  GET: {
    permission: "events.create",
    handler: async (req, res) => {
      const result = await exportTicketPayments(null, req.query);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="ticket-payments.csv"');
      return res.status(200).send(result.data);
    },
  },
});
