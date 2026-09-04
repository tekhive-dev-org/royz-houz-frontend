import { sendError } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { exportNewsletterSubscriptions } from "@/services/server/newsletterService";
import { newsletterListQuerySchema } from "@/validators/newsletter";

export default createAdminCrudHandler("/api/admin/newsletter/export", {
  GET: {
    permission: "contacts.update",
    handler: async (req, res, context) => {
      const parsed = newsletterListQuerySchema.safeParse(req.query);
      if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Invalid newsletter filters.", { status: 400 });
      const result = await exportNewsletterSubscriptions(null, { ...parsed.data, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="newsletter-subscriptions.csv"');
      return res.status(200).send(result.data);
    },
  },
});
