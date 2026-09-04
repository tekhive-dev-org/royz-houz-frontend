import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Admin API/page smoke test. Boots the production server (`next start`)
 * against the already-built `.next` output, verifies that protected routes and
 * pages require authentication, and confirms no merchandise API exists. Run
 * with `npm run test:smoke` from admin/.
 */
const PORT = process.env.SMOKE_PORT || "3211";
const BASE = `http://localhost:${PORT}`;
const APP_ROOT = fileURLToPath(new URL("../", import.meta.url));

const server = spawn("node_modules/.bin/next", ["start", "-p", PORT], {
  cwd: APP_ROOT,
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env },
});

const failures = [];
function check(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✔ ${name}`);
  } else {
    failures.push(name);
    console.error(`  ✖ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function waitUntilReady(timeoutMs = 45_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${BASE}/api/admin/health`);
      if (response.ok) return true;
    } catch {
      // Server still booting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function getJson(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, options);
  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response is asserted separately.
  }
  return { response, body };
}

try {
  console.log(`Booting admin production server on port ${PORT}...`);
  const ready = await waitUntilReady();
  check("server starts and /api/admin/health is reachable", ready);
  if (!ready) {
    console.error("Server did not become ready in time.");
    process.exitCode = 1;
  } else {
    const { body: healthBody } = await getJson("/api/admin/health");
    check("health endpoint is minimal and unauthenticated", healthBody?.data?.status === "ready");

    // Every protected admin API must reject unauthenticated callers.
    for (const path of [
      "/api/admin/talents",
      "/api/admin/events",
      "/api/admin/blog/posts",
      "/api/admin/media",
      "/api/admin/media-library",
      "/api/admin/contacts",
      "/api/admin/applications",
      "/api/admin/donations/records",
      "/api/admin/access-control/roles",
      "/api/admin/access-control/profiles",
      "/api/admin/access-control/invitations",
      "/api/admin/access-control/audit-logs",
      "/api/admin/site/navigation",
      "/api/admin/seo/records",
    ]) {
      const { response: r, body: b } = await getJson(path);
      check(
        `GET ${path} without session is rejected`,
        r.status === 401 && b?.error?.code === "SESSION_EXPIRED"
      );
    }

    // The dashboard guard uses getAuthenticatedAdmin and reports its own code.
    const { response: dashboardResponse, body: dashboardBody } = await getJson("/api/admin/dashboard");
    check(
      "GET /api/admin/dashboard without session is rejected",
      dashboardResponse.status === 401 &&
        ["SESSION_EXPIRED", "ADMIN_ACCESS_REQUIRED"].includes(dashboardBody?.error?.code)
    );

    // Mutations are equally guarded.
    const { response: postResponse, body: postBody } = await getJson("/api/admin/talents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Bypass attempt", status: "published" }),
    });
    check(
      "POST /api/admin/talents without session is rejected",
      postResponse.status === 401 && postBody?.error?.code === "SESSION_EXPIRED"
    );

    // No merchandise API route may exist.
    const merchandiseApi = await fetch(`${BASE}/api/admin/merchandise`);
    check("GET /api/admin/merchandise returns 404 (no commerce API)", merchandiseApi.status === 404);

    // Protected pages redirect to login when unauthenticated; login is public.
    // Fetch with redirect:"manual" so the 3xx response is observed instead of
    // following the redirect to the login page.
    for (const path of ["/", "/talents", "/media", "/merchandise", "/users-and-roles"]) {
      const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
      const location = response.headers.get("location") || "";
      check(
        `GET ${path} without session redirects to login`,
        [301, 302, 303, 307, 308].includes(response.status) &&
          (location.startsWith("/login") || location.startsWith("/unauthorized"))
      );
    }

    const { response: loginResponse } = await getJson("/login");
    check("GET /login renders publicly", loginResponse.status === 200);
  }
} catch (error) {
  failures.push(`smoke harness error: ${error.message}`);
  console.error(error);
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    server.once("exit", resolve);
    setTimeout(resolve, 3000);
  });
}

if (failures.length) {
  console.error(`\nSmoke test failures (${failures.length}):\n  - ${failures.join("\n  - ")}`);
  process.exitCode = 1;
} else {
  console.log("\nAdmin smoke tests passed.");
}
