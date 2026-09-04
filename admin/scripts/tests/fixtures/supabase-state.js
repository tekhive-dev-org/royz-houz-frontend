/**
 * Shared mutable authorization scenario for the admin security tests. The
 * fixture client modules read this state so `requireAdminPermission` can be
 * exercised across the full authorization decision tree without network access.
 */
let scenario = {};

export function setScenario(next) {
  scenario = next;
}

export function getScenario() {
  return scenario;
}

export function createMockSupabase(activeScenario) {
  function queryBuilder(table) {
    const builder = {
      select() {
        return builder;
      },
      eq() {
        return builder;
      },
      is() {
        return builder;
      },
      or() {
        return builder;
      },
      maybeSingle() {
        return Promise.resolve(
          table === "admin_profiles"
            ? activeScenario.profile()
            : activeScenario.assignments()
        );
      },
      // Real supabase-js query builders are thenable, so a query that ends with
      // a filter (without a terminal method) can still be awaited. Promise.all
      // flattens this thenable exactly like it would for the real client.
      then(resolve, reject) {
        const response =
          table === "admin_profiles"
            ? activeScenario.profile()
            : activeScenario.assignments();
        return Promise.resolve(response).then(resolve, reject);
      },
    };
    return builder;
  }

  return {
    auth: {
      getUser() {
        return Promise.resolve(activeScenario.getUser());
      },
    },
    from(table) {
      return queryBuilder(table);
    },
    rpc(functionName) {
      return Promise.resolve(activeScenario.rpc(functionName));
    },
  };
}
