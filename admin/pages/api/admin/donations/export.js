import { sendError } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { exportRecordsCsv } from "@/services/server/donationsService";
import { recordListQuerySchema } from "@/validators/donations";

export default createAdminCrudHandler("/api/admin/donations/export", {
  GET: {
    permission: "donations.export",
    handler: async (req, res, context) => {
      const parsed = recordListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          requestId: context.requestId,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }

      const result = await exportRecordsCsv(null, { actorUserId: context.actor.user.id, filters: parsed.data });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="donation-records.csv"');
      return res.status(200).send(result.data);
    },
  },
});
