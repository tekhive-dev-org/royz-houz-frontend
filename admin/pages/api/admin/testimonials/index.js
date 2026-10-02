import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { getRowBySlug, upsertContentRow } from "@/services/server/contentService";
import {
  testimonialItemSchema,
  testimonialsPayloadSchema,
  reorderTestimonialsSchema,
} from "@/validators/testimonials";
import { DEFAULT_TESTIMONIALS } from "@/components/content/SectionsEditor";

const TESTIMONIALS_SLUG = "testimonials";

function getDefaultTestimonialsContent() {
  return {
    badge: "TESTIMONIALS",
    title: "Impact - Changing Stories",
    description:
      "Explore the stories and experiences of members who have connected and found meaningful opportunities.",
    items: DEFAULT_TESTIMONIALS.map((t, index) => ({
      ...t,
      rating: 5,
      isActive: true,
      sortOrder: index + 1,
    })),
  };
}

async function getOrInitTestimonialsRecord(actorUserId) {
  const existing = await getRowBySlug(null, "site_settings", TESTIMONIALS_SLUG);
  if (existing.success && existing.data) {
    const content = existing.data.content || {};
    const items = Array.isArray(content.items) ? content.items : getDefaultTestimonialsContent().items;
    return {
      record: existing.data,
      content: {
        badge: content.badge || "TESTIMONIALS",
        title: content.title || existing.data.title || "Impact - Changing Stories",
        description:
          content.description ||
          existing.data.summary ||
          "Explore the stories and experiences of members who have connected and found meaningful opportunities.",
        items,
      },
    };
  }

  // Initialize
  const defaultContent = getDefaultTestimonialsContent();
  const initResult = await upsertContentRow(null, {
    table: "site_settings",
    actorUserId: actorUserId || null,
    row: {
      slug: TESTIMONIALS_SLUG,
      title: "Testimonials & Reviews",
      summary: defaultContent.description,
      content: defaultContent,
      sort_order: 15,
    },
    status: "published",
  });

  return {
    record: initResult.success ? initResult.data : null,
    content: defaultContent,
  };
}

async function persistTestimonials(record, content, actorUserId) {
  return upsertContentRow(null, {
    table: "site_settings",
    actorUserId,
    row: {
      ...(record?.id ? { id: record.id } : {}),
      slug: TESTIMONIALS_SLUG,
      title: content.title || "Testimonials & Reviews",
      summary: content.description,
      content,
      sort_order: 15,
    },
    status: "published",
  });
}

export default createAdminCrudHandler("/api/admin/testimonials", {
  GET: {
    permission: "homepage.read",
    handler: async (_req, res, context) => {
      const { content } = await getOrInitTestimonialsRecord(context.actor?.user?.id);
      return sendSuccess(res, content);
    },
  },

  POST: {
    permission: "homepage.update",
    handler: async (req, res, context) => {
      const body = getJsonBody(req);
      const { record, content } = await getOrInitTestimonialsRecord(context.actor.user.id);

      // Check if saving single item
      if (body.item) {
        const validated = validateRequest({
          res,
          schema: testimonialItemSchema,
          input: body.item,
          requestId: context.requestId,
          logContext: context,
        });
        if (!validated) return null;

        const maxSortOrder = content.items.reduce((max, it) => Math.max(max, it.sortOrder || 0), 0);
        const newItem = {
          ...validated,
          id: validated.id || `testimonial-${Date.now()}`,
          sortOrder: maxSortOrder + 1,
        };

        const updatedContent = {
          ...content,
          items: [...content.items, newItem],
        };

        const saveResult = await persistTestimonials(record, updatedContent, context.actor.user.id);
        if (!saveResult.success) {
          return sendError(res, saveResult.error.code, saveResult.error.message, {
            status: 400,
            requestId: context.requestId,
          });
        }

        return sendSuccess(res, newItem, { status: 201, requestId: context.requestId });
      }

      // Or full payload
      const validatedPayload = validateRequest({
        res,
        schema: testimonialsPayloadSchema,
        input: body,
        requestId: context.requestId,
        logContext: context,
      });
      if (!validatedPayload) return null;

      const saveResult = await persistTestimonials(record, validatedPayload, context.actor.user.id);
      if (!saveResult.success) {
        return sendError(res, saveResult.error.code, saveResult.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }

      return sendSuccess(res, validatedPayload, { status: 201, requestId: context.requestId });
    },
  },

  PUT: {
    permission: "homepage.update",
    handler: async (req, res, context) => {
      const body = getJsonBody(req);
      const { record, content } = await getOrInitTestimonialsRecord(context.actor.user.id);

      // If updating a single item
      if (body.item) {
        const validatedItem = validateRequest({
          res,
          schema: testimonialItemSchema,
          input: body.item,
          requestId: context.requestId,
          logContext: context,
        });
        if (!validatedItem) return null;

        const updatedItems = content.items.map((it) =>
          it.id === validatedItem.id ? { ...it, ...validatedItem } : it
        );

        const updatedContent = {
          ...content,
          items: updatedItems,
        };

        const saveResult = await persistTestimonials(record, updatedContent, context.actor.user.id);
        if (!saveResult.success) {
          return sendError(res, saveResult.error.code, saveResult.error.message, {
            status: 400,
            requestId: context.requestId,
          });
        }

        return sendSuccess(res, validatedItem, { requestId: context.requestId });
      }

      // If updating header copy or entire list
      const updatedContent = {
        ...content,
        ...(typeof body.badge === "string" ? { badge: body.badge } : {}),
        ...(typeof body.title === "string" ? { title: body.title } : {}),
        ...(typeof body.description === "string" ? { description: body.description } : {}),
        ...(Array.isArray(body.items) ? { items: body.items } : {}),
      };

      const saveResult = await persistTestimonials(record, updatedContent, context.actor.user.id);
      if (!saveResult.success) {
        return sendError(res, saveResult.error.code, saveResult.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }

      return sendSuccess(res, updatedContent, { requestId: context.requestId });
    },
  },

  PATCH: {
    permission: "homepage.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: reorderTestimonialsSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const { record, content } = await getOrInitTestimonialsRecord(context.actor.user.id);
      const itemMap = new Map(content.items.map((it) => [it.id, it]));

      // Re-ordered list according to ids
      const reordered = [];
      input.ids.forEach((id, idx) => {
        const found = itemMap.get(id);
        if (found) {
          reordered.push({ ...found, sortOrder: idx + 1 });
          itemMap.delete(id);
        }
      });
      // Append any items that were not in the IDs list
      itemMap.forEach((it) => {
        reordered.push({ ...it, sortOrder: reordered.length + 1 });
      });

      const updatedContent = {
        ...content,
        items: reordered,
      };

      const saveResult = await persistTestimonials(record, updatedContent, context.actor.user.id);
      if (!saveResult.success) {
        return sendError(res, saveResult.error.code, saveResult.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }

      return sendSuccess(res, updatedContent, { requestId: context.requestId });
    },
  },

  DELETE: {
    permission: "homepage.update",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A testimonial ID is required.", {
          status: 400,
          requestId: context.requestId,
        });
      }

      const { record, content } = await getOrInitTestimonialsRecord(context.actor.user.id);
      const filteredItems = content.items.filter((it) => it.id !== id);

      const updatedContent = {
        ...content,
        items: filteredItems,
      };

      const saveResult = await persistTestimonials(record, updatedContent, context.actor.user.id);
      if (!saveResult.success) {
        return sendError(res, saveResult.error.code, saveResult.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }

      return sendSuccess(res, { id }, { requestId: context.requestId });
    },
  },
});
