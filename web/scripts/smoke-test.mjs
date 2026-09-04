import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Public web API/page smoke test. Boots the production server (`next start`)
 * against the already-built `.next` output, exercises public endpoints and
 * pages, then shuts the server down. Run with `npm run test:smoke` from web/.
 */
const PORT = process.env.SMOKE_PORT || "3210";
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
      const response = await fetch(`${BASE}/api/health`);
      if (response.ok) return true;
    } catch {
      // Server still booting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function getJson(path) {
  const response = await fetch(`${BASE}${path}`);
  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response is asserted separately.
  }
  return { response, body };
}

try {
  console.log(`Booting web production server on port ${PORT}...`);
  const ready = await waitUntilReady();
  check("server starts and /api/health is reachable", ready);
  if (!ready) {
    console.error("Server did not become ready in time.");
    process.exitCode = 1;
  } else {
    // Health and public content endpoints return the documented JSON envelope.
    const { response, body } = await getJson("/api/health");
    check("GET /api/health returns 200", response.status === 200);
    check("health envelope is { success: true }", body?.success === true);

    for (const path of [
      "/api/home",
      "/api/about",
      "/api/talents",
      "/api/events",
      "/api/blog/posts",
      "/api/blog/categories",
      "/api/media",
      "/api/site/settings",
      "/api/site/navigation",
      "/api/site/footer",
      "/api/donations/campaigns",
      "/api/seo",
    ]) {
      const { response: r, body: b } = await getJson(path);
      const envelopeOk = b && typeof b.success === "boolean";
      const safeError =
        !b?.success ? b?.error?.code && typeof b?.error?.code === "string" : true;
      check(`GET ${path} returns envelope`, r.status >= 200 && r.status < 600 && envelopeOk);
      check(`GET ${path} never leaks raw errors`, safeError);
    }

    // Method allowlists and validation run before any database call.
    const { response: methodResponse } = await getJson("/api/contact");
    check("GET /api/contact is rejected (405)", methodResponse.status === 405);

    const invalidContact = await fetch(`${BASE}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "", email: "bad", message: "" }),
    });
    const contactBody = await invalidContact.json().catch(() => null);
    check("POST /api/contact invalid payload returns 400", invalidContact.status === 400);
    check(
      "validation error envelope is safe",
      contactBody?.success === false && contactBody?.error?.code === "VALIDATION_ERROR"
    );

    const invalidComment = await fetch(`${BASE}/api/blog/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: "not-a-uuid", authorName: "", authorEmail: "", body: "" }),
    });
    const commentBody = await invalidComment.json().catch(() => null);
    check("POST /api/blog/comments invalid payload returns 400", invalidComment.status === 400);
    check(
      "comment validation error is safe",
      commentBody?.success === false && commentBody?.error?.code === "VALIDATION_ERROR"
    );

    const invalidDonation = await fetch(`${BASE}/api/donations/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignSlug: "bad slug", donorName: "", donorEmail: "x", amount: -1 }),
    });
    check("POST /api/donations/record invalid payload returns 400", invalidDonation.status === 400);

    // No merchandise/cart/commerce API may exist on the public web app.
    const merchandiseApi = await fetch(`${BASE}/api/merchandise`);
    check("GET /api/merchandise returns 404 (no commerce API)", merchandiseApi.status === 404);

    // Key public pages render (Supabase may be offline; pages use safe fallbacks).
    for (const path of ["/", "/about", "/talents", "/events", "/blog", "/media", "/contact", "/join", "/donate", "/merchandise"]) {
      const { response: pageResponse } = await getJson(path);
      check(`GET ${path} renders`, pageResponse.status === 200);
    }

    const missing = await fetch(`${BASE}/this-page-does-not-exist`);
    check("unknown route returns 404 page", missing.status === 404);
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
  console.log("\nWeb smoke tests passed.");
}
