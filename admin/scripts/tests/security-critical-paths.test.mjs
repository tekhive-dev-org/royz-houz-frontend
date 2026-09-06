import { test } from "node:test";
import assert from "node:assert/strict";

import { createMockSupabase, getScenario, setScenario } from "./fixtures/supabase-state.js";

// The preloaded alias loader (see register-alias.mjs) redirects
// `@/lib/supabase/server` and `@/lib/supabase/service-role` to the fixture
// modules, so `requireAdminPermission` runs its real decision tree without
// network access or credentials.
const { requireAdminPermission } = await import("../../services/server/adminAuthorizationService.js");

const USER = { id: "11111111-1111-1111-1111-111111111111", email: "admin@example.test" };
const ACTIVE_PROFILE = { user_id: USER.id, display_name: "Test Admin", status: "active" };
const EDITOR_ASSIGNMENT = [
  { role_id: "role-editor", expires_at: null, roles: { role_key: "editor", name: "Editor" } },
];

function makeRequest(overrides = {}) {
  return {
    headers: {},
    cookies: {},
    body: null,
    ...overrides,
  };
}

function makeResponse() {
  return {
    statusCode: 0,
    headers: {},
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
  };
}

function authorizedScenario() {
  return {
    getUser: () => ({ data: { user: USER }, error: null }),
    profile: () => ({ data: ACTIVE_PROFILE, error: null }),
    assignments: () => ({ data: EDITOR_ASSIGNMENT, error: null }),
    rpc: () => ({ data: true, error: null }),
  };
}

function editorWithoutPermission() {
  return {
    getUser: () => ({ data: { user: USER }, error: null }),
    profile: () => ({ data: ACTIVE_PROFILE, error: null }),
    assignments: () => ({ data: EDITOR_ASSIGNMENT, error: null }),
    rpc: () => ({ data: false, error: null }),
  };
}

test("admin API: unauthenticated requests are rejected with 401", async () => {
  setScenario({
    getUser: () => ({ data: { user: null }, error: { message: "no session" } }),
  });
  const res = makeResponse();
  const result = await requireAdminPermission(makeRequest(), res, "settings.read", {
    client: createMockSupabase(getScenario()),
  });

  assert.equal(result, null);
  assert.equal(res.statusCode, 401);
  assert.equal(res.payload.error.code, "SESSION_EXPIRED");
});

test("admin API: authenticated users without an active admin profile are denied", async () => {
  setScenario({
    getUser: () => ({ data: { user: USER }, error: null }),
    profile: () => ({ data: null, error: null }),
    assignments: () => ({ data: [], error: null }),
    rpc: () => ({ data: false, error: null }),
  });
  const res = makeResponse();
  const result = await requireAdminPermission(makeRequest(), res, "settings.read", {
    client: createMockSupabase(getScenario()),
  });

  assert.equal(result, null);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.error.code, "ADMIN_ACCESS_REQUIRED");
});

test("admin API: suspended admin profiles are denied", async () => {
  setScenario({
    getUser: () => ({ data: { user: USER }, error: null }),
    profile: () => ({ data: { ...ACTIVE_PROFILE, status: "suspended" }, error: null }),
    assignments: () => ({ data: EDITOR_ASSIGNMENT, error: null }),
    rpc: () => ({ data: false, error: null }),
  });
  const res = makeResponse();
  const result = await requireAdminPermission(makeRequest(), res, "settings.read", {
    client: createMockSupabase(getScenario()),
  });

  assert.equal(result, null);
  assert.equal(res.statusCode, 403);
});

test("admin API: exact server-side permission is required", async () => {
  setScenario(editorWithoutPermission());
  const res = makeResponse();
  const result = await requireAdminPermission(makeRequest(), res, "settings.update", {
    client: createMockSupabase(getScenario()),
  });

  assert.equal(result, null);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.error.code, "PERMISSION_DENIED");
});

test("admin API: destructive operations require the exact destructive permission", async () => {
  setScenario(editorWithoutPermission());
  const res = makeResponse();
  const result = await requireAdminPermission(makeRequest(), res, "talents.delete", {
    client: createMockSupabase(getScenario()),
  });

  assert.equal(result, null);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.error.code, "PERMISSION_DENIED");
});

test("admin API: client-supplied roles are never trusted", async () => {
  setScenario(editorWithoutPermission());
  const res = makeResponse();
  const forgedRequest = makeRequest({ body: { role: "super_admin", permission: "settings.update" } });
  const result = await requireAdminPermission(forgedRequest, res, "settings.update", {
    client: createMockSupabase(getScenario()),
  });

  assert.equal(result, null);
  assert.equal(res.statusCode, 403);
});

test("admin API: an admin with the exact permission is authorized", async () => {
  setScenario(authorizedScenario());
  const res = makeResponse();
  const result = await requireAdminPermission(makeRequest(), res, "settings.read", {
    client: createMockSupabase(getScenario()),
  });

  assert.equal(res.statusCode, 0, "no error response is sent");
  assert.equal(result.permission, "settings.read");
  assert.equal(result.user.id, USER.id);
  assert.deepEqual(result.admin.roles, ["editor"]);
});

test("admin API: invalid permission keys are rejected before any database call", async () => {
  setScenario(authorizedScenario());
  const res = makeResponse();
  await assert.rejects(
    requireAdminPermission(makeRequest(), res, "delete", { client: createMockSupabase(getScenario()) }),
    /invalid permission key/
  );
  await assert.rejects(
    requireAdminPermission(makeRequest(), res, "../settings.read", { client: createMockSupabase(getScenario()) }),
    /invalid permission key/
  );
});

test("validators: safeUrlSchema handles valid URLs and converts empty strings to undefined", async () => {
  const { safeUrlSchema, requiredSafeUrlSchema } = await import("../../utils/safeUrl.js");
  
  assert.equal(safeUrlSchema.parse(""), undefined);
  assert.equal(safeUrlSchema.parse("   "), undefined);
  assert.equal(safeUrlSchema.parse("/about"), "/about");
  assert.equal(safeUrlSchema.parse("https://royzhouz.com"), "https://royzhouz.com");
  assert.throws(() => safeUrlSchema.parse("javascript:alert(1)"));
  assert.throws(() => requiredSafeUrlSchema.parse(""));
  assert.equal(requiredSafeUrlSchema.parse("https://royzhouz.com"), "https://royzhouz.com");
});

test("media validation: accepts approved audio files and rejects unsupported or oversized audio", async () => {
  const { registerCloudinaryUploadSchema, signedUploadRequestSchema } = await import("../../validators/media.js");

  const valid = signedUploadRequestSchema.parse({
    mediaType: "audio",
    fileName: "talent-track.mp3",
    mimeType: "audio/mpeg",
    bytes: 5 * 1024 * 1024,
  });
  assert.equal(valid.mediaType, "audio");
  assert.throws(() =>
    signedUploadRequestSchema.parse({
      mediaType: "audio",
      fileName: "unsafe.exe",
      mimeType: "application/octet-stream",
      bytes: 1024,
    })
  );
  assert.throws(() =>
    signedUploadRequestSchema.parse({
      mediaType: "audio",
      fileName: "oversized.wav",
      mimeType: "audio/wav",
      bytes: 51 * 1024 * 1024,
    })
  );

  const registeredAudio = registerCloudinaryUploadSchema.parse({
    asset: {
      mediaType: "audio",
      slug: "talent-track",
      title: "Talent Track",
    },
    upload: {
      public_id: "royz-houz/media/audio/talent-track",
      resource_type: "video",
      secure_url: "https://res.cloudinary.com/demo/video/upload/talent-track.mp3",
      format: "mp3",
      width: 0,
      height: 0,
      duration: 180,
      bytes: 1024,
    },
  });
  assert.equal(registeredAudio.upload.width, null);
  assert.equal(registeredAudio.upload.height, null);
  assert.throws(() =>
    registerCloudinaryUploadSchema.parse({
      ...registeredAudio,
      upload: { ...registeredAudio.upload, width: -1 },
    })
  );
});

test("admin API wrapper does not return the NextApiResponse object", async () => {
  const { withAdminApiHandler } = await import("../../utils/apiHandler.js");
  const response = makeResponse();
  const handler = withAdminApiHandler("/api/admin/test", {
    POST: async (_request, res) => res.status(201).json({ success: true }),
  });

  const result = await handler(makeRequest({ method: "POST" }), response);

  assert.equal(result, undefined);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.payload, { success: true });
});

test("content report moderation validation requires a resolution when closing reports", async () => {
  const { contentReportListSchema, contentReportUpdateSchema } = await import("../../validators/contentReports.js");
  const id = "11111111-1111-4111-8111-111111111111";

  assert.doesNotThrow(() => contentReportListSchema.parse({ status: "reviewing", reason: "spam" }));
  assert.doesNotThrow(() => contentReportUpdateSchema.parse({ id, status: "reviewing" }));
  assert.throws(() => contentReportUpdateSchema.parse({ id, status: "actioned" }));
  assert.doesNotThrow(() =>
    contentReportUpdateSchema.parse({ id, status: "actioned", resolution: "Removed the violating media." })
  );
  assert.throws(() => contentReportUpdateSchema.parse({ id, status: "unknown" }));
});

test("validators: siteSettingSchema validates named site configuration records", async () => {
  const { siteSettingSchema } = await import("../../validators/site.js");

  const valid = siteSettingSchema.parse({
    slug: "custom-site-config",
    title: "Custom Site Config",
    summary: "A test configuration record",
    content: { theme: "dark", bannerEnabled: true },
    status: "published",
  });
  assert.equal(valid.slug, "custom-site-config");
  assert.equal(valid.title, "Custom Site Config");
  assert.deepEqual(valid.content, { theme: "dark", bannerEnabled: true });

  assert.throws(() => siteSettingSchema.parse({ slug: "INVALID SLUG!", title: "Bad" }));
});

test("validators: creation schemas permit optional slugs for backend unique autogeneration", async () => {
  const { blogPostSchema } = await import("../../validators/blog.js");
  const { eventSchema } = await import("../../validators/events.js");
  const { talentSchema } = await import("../../validators/talents.js");
  const { campaignSchema } = await import("../../validators/donations.js");

  assert.doesNotThrow(() => blogPostSchema.parse({ title: "New Blog Post" }));
  const parsedWithEmptySlug = blogPostSchema.parse({ title: "New Blog Post", slug: "   " });
  assert.strictEqual(parsedWithEmptySlug.slug, undefined);
  assert.doesNotThrow(() => eventSchema.parse({ title: "New Live Concert" }));
  assert.doesNotThrow(() => talentSchema.parse({ name: "New Emerging Talent" }));
  assert.doesNotThrow(() => campaignSchema.parse({ title: "New Donation Campaign" }));
});

test("validators: invitation schemas enforce strong security constraints", async () => {
  const { inviteVerifySchema, inviteAcceptSchema } = await import("../../validators/accessControl.js");

  // Verify schema requires non-empty token
  assert.doesNotThrow(() => inviteVerifySchema.parse({ token: "a_valid_invitation_token_12345" }));
  assert.throws(() => inviteVerifySchema.parse({ token: "short" }));
  assert.throws(() => inviteVerifySchema.parse({}));

  // Accept schema requires strong password & valid name
  assert.doesNotThrow(() =>
    inviteAcceptSchema.parse({
      token: "a_valid_invitation_token_12345",
      displayName: "Jane Doe",
      password: "StrongPassword123!",
    })
  );

  // Rejects weak passwords
  assert.throws(() =>
    inviteAcceptSchema.parse({
      token: "a_valid_invitation_token_12345",
      displayName: "Jane Doe",
      password: "alllowercase123", // Missing uppercase
    })
  );
  assert.throws(() =>
    inviteAcceptSchema.parse({
      token: "a_valid_invitation_token_12345",
      displayName: "Jane Doe",
      password: "ALLUPPERCASE123", // Missing lowercase
    })
  );
  assert.throws(() =>
    inviteAcceptSchema.parse({
      token: "a_valid_invitation_token_12345",
      displayName: "Jane Doe",
      password: "NoDigitsPassword!", // Missing number
    })
  );
  assert.throws(() =>
    inviteAcceptSchema.parse({
      token: "a_valid_invitation_token_12345",
      displayName: "Jane Doe",
      password: "short", // Too short
    })
  );
});

test("accessControlService: verifyInvitation rejects empty or invalid tokens", async () => {
  const { verifyInvitation } = await import("../../services/server/accessControlService.js");

  const emptyResult = await verifyInvitation(createMockSupabase(authorizedScenario()), { token: "" });
  assert.strictEqual(emptyResult.success, false);
  assert.strictEqual(emptyResult.error.code, "INVALID_TOKEN");

  const nullResult = await verifyInvitation(createMockSupabase(authorizedScenario()), { token: null });
  assert.strictEqual(nullResult.success, false);
  assert.strictEqual(nullResult.error.code, "INVALID_TOKEN");
});


