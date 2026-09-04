import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeYouTubeUrl, isYouTubeVideoId } from "../../utils/media/youtube.js";
import { enforceRateLimit } from "../../utils/rateLimit.js";
import { sanitizePlainText, sanitizeSubmissionInput } from "../../utils/sanitize.js";
import { parseWithSchema } from "../../validators/common.js";
import { contactSubmissionSchema } from "../../validators/contact.js";
import { contentReportSchema } from "../../validators/contentReport.js";
import { bookingRequestSchema } from "../../validators/booking.js";
import { blogCommentSchema, donationRecordSchema } from "../../validators/api.js";

/**
 * Critical public-path security tests: media URL safety, rate-limit spoofing
 * protection, submission sanitization, and API validation boundaries. RLS and
 * database function denials are verified separately in web/supabase/rls-verification.sql.
 */

// ── YouTube normalization safety ────────────────────────────────────────────

test("youtube: normalizes watch, short, and youtu.be URLs to safe metadata", () => {
  const watch = normalizeYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.equal(watch.videoId, "dQw4w9WgXcQ");
  assert.equal(watch.embedUrl, "https://www.youtube.com/embed/dQw4w9WgXcQ");

  const short = normalizeYouTubeUrl("https://youtube.com/shorts/dQw4w9WgXcQ");
  assert.equal(short.videoId, "dQw4w9WgXcQ");

  const youtuBe = normalizeYouTubeUrl("https://youtu.be/dQw4w9WgXcQ");
  assert.equal(youtuBe.videoId, "dQw4w9WgXcQ");
  assert.equal(youtuBe.thumbnailUrl, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
});

test("youtube: rejects unsupported hosts, iframe HTML, and malformed identifiers", () => {
  assert.throws(() => normalizeYouTubeUrl("https://vimeo.com/12345"));
  assert.throws(() => normalizeYouTubeUrl("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"));
  assert.throws(() => normalizeYouTubeUrl('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>'));
  assert.throws(() => normalizeYouTubeUrl("https://www.youtube.com/watch?v=not!valid@id"));
  assert.throws(() => normalizeYouTubeUrl("https://youtu.be/too-short"));
  assert.throws(() => normalizeYouTubeUrl("https://www.youtube.com/watch?v="));
  assert.throws(() => normalizeYouTubeUrl("https://user:pass@youtu.be/dQw4w9WgXcQ"));
  assert.throws(() => normalizeYouTubeUrl("https://www.youtube.com:8443/watch?v=dQw4w9WgXcQ"));
  assert.throws(() => normalizeYouTubeUrl("javascript:alert(1)"));
  assert.equal(isYouTubeVideoId("not!valid@id"), false);
  assert.equal(isYouTubeVideoId(""), false);
});

// ── Rate limiting and forwarded-address spoofing ────────────────────────────

function makeRequest({ remoteAddress = "203.0.113.7", forwardedFor } = {}) {
  const headers = {};
  if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;
  return { headers, socket: { remoteAddress } };
}

test("rate-limit: forged X-Forwarded-For does not rotate buckets by default", () => {
  const previous = process.env.TRUST_PROXY;
  delete process.env.TRUST_PROXY;
  try {
    let result;
    for (let index = 0; index < 5; index += 1) {
      result = enforceRateLimit(makeRequest({ forwardedFor: `192.0.2.${index}` }), {
        namespace: "contact",
        limit: 5,
        windowMs: 60_000,
      });
    }
    assert.equal(result.allowed, true, "five attempts within the limit are allowed");
    assert.equal(result.remaining, 0);

    const blocked = enforceRateLimit(makeRequest({ forwardedFor: "203.0.113.99" }), {
      namespace: "contact",
      limit: 5,
      windowMs: 60_000,
    });
    assert.equal(blocked.allowed, false, "the sixth attempt is denied even with a forged header");
  } finally {
    if (previous === undefined) delete process.env.TRUST_PROXY;
    else process.env.TRUST_PROXY = previous;
  }
});

test("rate-limit: with TRUST_PROXY enabled only the right-most trusted address is used", () => {
  const previous = process.env.TRUST_PROXY;
  process.env.TRUST_PROXY = "true";
  try {
    const first = enforceRateLimit(
      makeRequest({ remoteAddress: "10.0.0.1", forwardedFor: "198.51.100.1, 10.0.0.2" }),
      { namespace: "join", limit: 1, windowMs: 60_000 }
    );
    assert.equal(first.allowed, true);

    const sameClient = enforceRateLimit(
      makeRequest({ remoteAddress: "10.0.0.3", forwardedFor: "203.0.113.5, 10.0.0.2" }),
      { namespace: "join", limit: 1, windowMs: 60_000 }
    );
    assert.equal(sameClient.allowed, false, "right-most address is the client identifier");
  } finally {
    if (previous === undefined) delete process.env.TRUST_PROXY;
    else process.env.TRUST_PROXY = previous;
  }
});

// ── Submission sanitization ─────────────────────────────────────────────────

test("sanitize: strips HTML tags and control characters from submission text", () => {
  assert.equal(sanitizePlainText("<script>alert(1)</script>Hello"), "alert(1)Hello");
  assert.equal(sanitizePlainText("Hello\u0000World"), "HelloWorld");
  assert.equal(sanitizePlainText("  padded  "), "padded");

  const sanitized = sanitizeSubmissionInput({
    firstName: "<b>Ada</b>",
    message: "Hi\u0007there",
    tags: ["<i>a</i>", "b"],
    meta: { note: "x</p>" },
  });
  assert.deepEqual(sanitized, {
    firstName: "Ada",
    message: "Hithere",
    tags: ["a", "b"],
    meta: { note: "x" },
  });
});

// ── API validation boundaries ───────────────────────────────────────────────

test("contact schema: rejects empty, oversized, and malformed fields", () => {
  const rejected = parseWithSchema(contactSubmissionSchema, {
    firstName: "",
    email: "not-an-email",
    message: "x".repeat(601),
  });
  assert.equal(rejected.success, false);
  const fields = rejected.error.details.map((detail) => detail.field);
  assert.ok(fields.includes("firstName"));
  assert.ok(fields.includes("email"));
  assert.ok(fields.includes("message"));
});

test("contact schema: accepted input is trimmed and unknown fields are not persisted", () => {
  const result = parseWithSchema(contactSubmissionSchema, {
    firstName: "  Ada  ",
    email: "  ada@example.test  ",
    message: "Hello",
    role: "super_admin", // must never reach the database
  });
  assert.equal(result.success, true);
  assert.equal(result.data.firstName, "Ada");
  assert.equal(result.data.email, "ada@example.test");
  assert.equal("role" in result.data, false, "unexpected client fields are dropped");
});

test("content report schema requires stable targets and details for other reports", () => {
  const valid = parseWithSchema(contentReportSchema, {
    submissionKey: "11111111-1111-4111-8111-111111111111",
    targetType: "talent_media",
    targetId: "22222222-2222-4222-8222-222222222222",
    targetKey: "live-in-lagos",
    targetTitle: "Live in Lagos",
    reason: "inappropriate",
  });
  assert.equal(valid.success, true);
  assert.equal("workflowStatus" in valid.data, false);

  assert.equal(
    parseWithSchema(contentReportSchema, {
      ...valid.data,
      reason: "other",
      details: "",
    }).success,
    false
  );
  assert.equal(
    parseWithSchema(contentReportSchema, {
      ...valid.data,
      targetId: "not-a-uuid",
    }).success,
    false
  );
});

test("public API wrapper resolves without returning the response object", async () => {
  const { withApiHandler } = await import("../../utils/apiHandler.js");
  const response = {
    statusCode: 0,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
    setHeader() {},
  };
  const handler = withApiHandler("/api/test", {
    POST: async (_request, res) => res.status(201).json({ success: true }),
  });

  const result = await handler({ method: "POST" }, response);
  assert.equal(result, undefined);
  assert.equal(response.statusCode, 201);
});

test("booking schema accepts reviewed fields and rejects untrusted confirmation state", () => {
  const valid = parseWithSchema(bookingRequestSchema, {
    submissionKey: "11111111-1111-4111-8111-111111111111",
    talentId: "22222222-2222-4222-8222-222222222222",
    talentSlug: "ada-creative",
    talentName: "Ada Creative",
    firstName: "Ada",
    lastName: "Lange",
    email: "ada@example.test",
    phone: "+2348012345678",
    eventType: "Concert",
    eventDate: "2030-08-15",
    eventLocation: "Lagos",
    eventDescription: "A live performance for a private event.",
    budget: "250000",
    agreedToTerms: true,
    bookingReference: "forged-client-reference",
  });
  assert.equal(valid.success, true);
  assert.equal("bookingReference" in valid.data, false);
  assert.equal(
    parseWithSchema(bookingRequestSchema, { ...valid.data, agreedToTerms: false }).success,
    false
  );
  assert.equal(
    parseWithSchema(bookingRequestSchema, { ...valid.data, eventDate: "2030-02-31" }).success,
    false
  );
});

test("blog comment schema: enforces size and identifier boundaries", () => {
  const oversized = parseWithSchema(blogCommentSchema, {
    postId: "not-a-uuid",
    authorName: "A",
    authorEmail: "a@example.test",
    body: "x".repeat(5001),
  });
  assert.equal(oversized.success, false);
});

test("donation record schema: rejects fabricated totals and invalid identifiers", () => {
  const negative = parseWithSchema(donationRecordSchema, {
    campaignSlug: "career-skill-development",
    donorName: "Ada",
    donorEmail: "ada@example.test",
    amount: -5,
  });
  assert.equal(negative.success, false);

  const excessive = parseWithSchema(donationRecordSchema, {
    campaignSlug: "career-skill-development",
    donorName: "Ada",
    donorEmail: "ada@example.test",
    amount: 99_999_999,
  });
  assert.equal(excessive.success, false);

  const badCurrency = parseWithSchema(donationRecordSchema, {
    campaignSlug: "career-skill-development",
    donorName: "Ada",
    donorEmail: "ada@example.test",
    amount: 100,
    currency: "ngn",
  });
  assert.equal(badCurrency.success, false);
});
