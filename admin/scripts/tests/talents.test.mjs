import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const {
  normalizeTalentMusicTracks,
  normalizeTalentSlug,
  normalizeTalentVideos,
  saveTalent,
  syncTalentGalleryMediaReferences,
} = await import("../../services/server/talentsService.js");
const { talentSchema } = await import("../../validators/talents.js");
const { formatMediaDuration, getTalentPublicPath } = await import("../../utils/talents.js");

const ACTOR_ID = "11111111-1111-4111-8111-111111111111";
const CATEGORY_ID = "22222222-2222-4222-8222-222222222222";

function createTalentClient({ existingSlugs = [], existingTalent = null, insertError = null } = {}) {
  const writes = { talent: null, assignments: null };
  const slugOwners = new Map(existingSlugs.map((slug, index) => [slug, `existing-${index}`]));

  function builderFor(table) {
    const state = { operation: null, payload: null, slug: null, id: null, excludedId: null };
    const builder = {
      select() {
        return builder;
      },
      eq(column, value) {
        if (column === "slug") state.slug = value;
        if (column === "id") state.id = value;
        return builder;
      },
      neq(column, value) {
        if (column === "id") state.excludedId = value;
        return builder;
      },
      in() {
        return builder;
      },
      delete() {
        state.operation = "delete";
        return builder;
      },
      insert(payload) {
        state.operation = "insert";
        state.payload = payload;
        if (table === "talents") writes.talent = payload;
        if (table === "talent_category_assignments") writes.assignments = payload;
        return builder;
      },
      update(payload) {
        state.operation = "update";
        state.payload = payload;
        if (table === "talents") writes.talent = payload;
        return builder;
      },
      maybeSingle() {
        if (state.id && table === "talents") {
          return Promise.resolve({
            data: existingTalent?.id === state.id ? existingTalent : null,
            error: null,
          });
        }
        const owner = slugOwners.get(state.slug);
        return Promise.resolve({
          data: owner && owner !== state.excludedId ? { id: owner } : null,
          error: null,
        });
      },
      single() {
        if (table !== "talents") return Promise.resolve({ data: state.payload, error: null });
        if (insertError) return Promise.resolve({ data: null, error: insertError });
        return Promise.resolve({ data: { ...state.payload, id: state.payload.id || state.id || state.excludedId }, error: null });
      },
      then(resolve, reject) {
        let response = { data: null, error: null };
        if (table === "talent_categories") {
          response = { data: [{ id: CATEGORY_ID, status: "published", title: "Musician", slug: "musicians" }], error: null };
        }
        return Promise.resolve(response).then(resolve, reject);
      },
    };
    return builder;
  }

  return {
    writes,
    from: builderFor,
    rpc() {
      return Promise.resolve({ data: true, error: null });
    },
  };
}

function validTalent(overrides = {}) {
  return {
    name: "Áda Creative",
    category: "Musician",
    categoryKey: "musicians",
    categoryIds: [CATEGORY_ID],
    primaryCategoryId: CATEGORY_ID,
    status: "draft",
    featured: false,
    sortOrder: 0,
    ...overrides,
  };
}

test("talent editor: empty talent is a clean draft without demo or rickroll content", async () => {
  const source = await readFile(new URL("../../components/talents/TalentsAdmin.js", import.meta.url), "utf8");
  const emptyTalentBlock = source.slice(source.indexOf("const EMPTY_TALENT"), source.indexOf("const EMPTY_CATEGORY"));

  assert.match(emptyTalentBlock, /status: "draft"/);
  assert.match(emptyTalentBlock, /awards: \[\]/);
  assert.match(emptyTalentBlock, /galleryImages: \[\]/);
  assert.match(emptyTalentBlock, /videos: \[\]/);
  assert.match(emptyTalentBlock, /musicTracks: \[\]/);
  assert.match(emptyTalentBlock, /publications: \[\]/);
  assert.doesNotMatch(emptyTalentBlock, /dQw4w9WgXcQ|BBC Africa|Golden Hour|Royz House Excellence Award/);
});

test("talent validator: normalizes optional slugs and retains production CMS fields", () => {
  const parsed = talentSchema.parse({
    ...validTalent(),
    slug: "  CUSTOM-SLUG  ",
    profession: "Producer",
    genre: "Afrobeats",
    badge: "MUSIC",
    alt: "Ada performing on stage",
    socials: { facebook: "https://facebook.com/ada" },
    publications: [{ title: "Ada Profile", type: "Interview", year: "2026", publisher: "Example", url: "https://example.com/ada" }],
    videos: [{ title: "Live", artist: "Ada Creative", videoUrl: "https://youtube.com/watch?v=example" }],
    musicTracks: [{ title: "Debut", streams: "1.2M", trackUrl: "https://example.com/debut" }],
  });

  assert.equal(parsed.slug, "custom-slug");
  assert.equal(parsed.status, "draft");
  assert.equal(parsed.alt, "Ada performing on stage");
  assert.equal(parsed.socials.facebook, "https://facebook.com/ada");
  assert.equal(parsed.publications[0].type, "Interview");
  assert.equal(parsed.publications[0].year, "2026");
  assert.equal(parsed.publications[0].publisher, "Example");
  assert.equal(parsed.videos[0].artist, "Ada Creative");
  assert.equal(parsed.musicTracks[0].streams, "1.2M");
  assert.equal(talentSchema.parse(validTalent({ slug: "" })).slug, undefined);
});

test("talent validator: enforces editorial metric boundaries and normalizes follower labels", () => {
  const parsed = talentSchema.parse(validTalent({ rating: "4.9", followers: "125K followers" }));

  assert.equal(parsed.rating, 4.9);
  assert.equal(parsed.followers, "125K");
  assert.throws(() => talentSchema.parse(validTalent({ rating: "excellent" })));
  assert.throws(() => talentSchema.parse(validTalent({ rating: 5.1 })));
  assert.throws(() => talentSchema.parse(validTalent({ rating: -0.1 })));
});

test("talent editor utilities generate safe previews and media durations", () => {
  assert.equal(getTalentPublicPath({ name: "Áda Creative" }), "/talents/ada-creative");
  assert.equal(getTalentPublicPath({ id: "existing", slug: "stable-url", name: "Renamed" }), "/talents/stable-url");
  assert.equal(formatMediaDuration(270), "4:30");
  assert.equal(formatMediaDuration(3723), "1:02:03");
  assert.equal(formatMediaDuration(null), "");
});

test("talent service: generates stable, unique video slugs without user input", () => {
  const videos = normalizeTalentVideos([
    { id: "video-a", title: "Live in Lagos" },
    { id: "video-b", title: "Live in Lagos" },
    { id: "video-c", slug: "client-supplied-slug", title: "Renamed Video" },
  ]);

  assert.deepEqual(videos.map((video) => video.slug), ["live-in-lagos", "live-in-lagos-2", "renamed-video"]);
  assert.deepEqual(
    normalizeTalentVideos(
      videos.map((video) => ({ ...video, title: `${video.title} Updated`, slug: "untrusted-change" })),
      videos
    ).map((video) => video.slug),
    ["live-in-lagos", "live-in-lagos-2", "renamed-video"]
  );
});

test("talent service: generates stable, unique music slugs without user input", () => {
  const tracks = normalizeTalentMusicTracks([
    { id: "track-a", title: "Golden Hour" },
    { id: "track-b", title: "Golden Hour" },
    { id: "track-c", slug: "client-supplied-slug", title: "New Song" },
  ]);

  assert.deepEqual(tracks.map((track) => track.slug), [
    "golden-hour",
    "golden-hour-2",
    "new-song",
  ]);
  assert.deepEqual(
    normalizeTalentMusicTracks(
      tracks.map((track) => ({
        ...track,
        title: `${track.title} Updated`,
        slug: "untrusted-change",
      })),
      tracks
    ).map((track) => track.slug),
    ["golden-hour", "golden-hour-2", "new-song"]
  );
});

test("talent service: honors a valid custom slug and persists matching row/body identities", async () => {
  const client = createTalentClient();
  const result = await saveTalent(client, {
    actorUserId: ACTOR_ID,
    talent: validTalent({ slug: "bespoke-ada" }),
  });

  assert.equal(result.success, true);
  assert.equal(client.writes.talent.slug, "bespoke-ada");
  assert.match(client.writes.talent.id, /^[0-9a-f-]{36}$/);
  assert.equal(client.writes.talent.body.id, client.writes.talent.id);
  assert.equal(client.writes.talent.body.category, "Musician");
  assert.equal(client.writes.talent.body.categoryKey, "musicians");
  assert.deepEqual(client.writes.talent.body.videos, []);
  assert.equal(client.writes.assignments[0].talent_id, client.writes.talent.id);
  assert.equal(client.writes.assignments[0].talent_category_id, CATEGORY_ID);
  assert.equal(client.writes.assignments[0].is_primary, true);
});

test("talent service: auto-generates and safely suffixes a slug only when no custom slug is supplied", async () => {
  const client = createTalentClient({ existingSlugs: ["ada-creative", "ada-creative-2"] });
  const result = await saveTalent(client, {
    actorUserId: ACTOR_ID,
    talent: validTalent({ slug: undefined }),
  });

  assert.equal(result.success, true);
  assert.equal(normalizeTalentSlug("Áda Creative"), "ada-creative");
  assert.equal(client.writes.talent.slug, "ada-creative-3");
});

test("talent service: preserves the existing slug when an update omits it", async () => {
  const id = "33333333-3333-4333-8333-333333333333";
  const client = createTalentClient({ existingTalent: { id, slug: "stable-public-url" } });
  const result = await saveTalent(client, {
    actorUserId: ACTOR_ID,
    talent: validTalent({ id, slug: undefined, name: "Renamed Talent" }),
  });

  assert.equal(result.success, true);
  assert.equal(client.writes.talent.slug, "stable-public-url");
});

test("talent service: derives compatibility fields instead of trusting manual category or rate aliases", async () => {
  const client = createTalentClient();
  const result = await saveTalent(client, {
    actorUserId: ACTOR_ID,
    talent: validTalent({
      category: "Stale Category",
      categoryKey: "stale-category",
      bookingPrice: "",
      startingRate: "Contact for quote",
    }),
  });

  assert.equal(result.success, true);
  assert.equal(client.writes.talent.body.category, "Musician");
  assert.equal(client.writes.talent.body.categoryKey, "musicians");
  assert.equal(client.writes.talent.body.bookingPrice, "Contact for quote");
  assert.equal("startingRate" in client.writes.talent.body, false);
});

test("talent service: rejects an occupied custom slug instead of silently renaming it", async () => {
  const client = createTalentClient({ existingSlugs: ["reserved-profile"] });
  const result = await saveTalent(client, {
    actorUserId: ACTOR_ID,
    talent: validTalent({ slug: "reserved-profile" }),
  });

  assert.equal(result.success, false);
  assert.equal(result.error.code, "SLUG_CONFLICT");
  assert.equal(client.writes.talent, null);
});

test("talent service: maps a database uniqueness race to a safe slug conflict", async () => {
  const client = createTalentClient({ insertError: { code: "23505", message: "duplicate key details" } });
  const result = await saveTalent(client, {
    actorUserId: ACTOR_ID,
    talent: validTalent({ slug: "race-safe-slug" }),
  });

  assert.equal(result.success, false);
  assert.deepEqual(result.error, {
    code: "SLUG_CONFLICT",
    message: "A talent with this URL slug already exists.",
  });
});
