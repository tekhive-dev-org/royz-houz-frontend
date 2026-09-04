import { requireAdminPermission } from "@/services/server/adminAuthorizationService";
import { withAdminApiHandler } from "./apiHandler";

/**
 * Builds an independently protected CRUD route.
 *
 * `methods` maps an HTTP verb to `{ permission, handler }`. `permission` is the
 * exact permission key enforced before the handler runs; `handler` receives
 * `(req, res, context)` and `context.actor` is the authorized admin result.
 */
export function createAdminCrudHandler(route, methods) {
  const wrapped = Object.fromEntries(
    Object.entries(methods).map(([method, definition]) => [
      method,
      async (req, res, context) => {
        const actor = await requireAdminPermission(req, res, definition.permission, {
          requestId: context.requestId,
        });
        if (!actor) return null;
        return definition.handler(req, res, { ...context, actor });
      },
    ])
  );

  return withAdminApiHandler(route, wrapped);
}
