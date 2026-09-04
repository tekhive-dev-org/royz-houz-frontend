#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { loadWebsiteConstants } from "./lib/load-constants.mjs";
import { transformConstantsToRecords } from "./lib/constants-to-records.mjs";

const APPLY_FLAG = "--apply";
const CONFIRM_FLAG = "--confirm-constants-import";
const shouldApply = process.argv.includes(APPLY_FLAG);
const isConfirmed = process.argv.includes(CONFIRM_FLAG);

function getRequiredEnvironment(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

function countRecords(records) {
  return Object.fromEntries(
    Object.entries(records.tables).map(([table, rows]) => [table, rows.length])
  );
}

function logSummary(records, label) {
  console.log(`${label}:`);
  for (const [table, count] of Object.entries(countRecords(records))) {
    console.log(`  ${table}: ${count}`);
  }
  console.log(`  review-only media candidates: ${records.reviewCandidates.media_assets.length}`);
}

async function upsertRows(client, table, rows) {
  if (!rows.length) return;

  const { error } = await client.from(table).upsert(rows, {
    onConflict: "slug",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(`Unable to upsert ${table}. Verify the approved web migrations are applied.`);
  }
}

async function fetchIdMap(client, table) {
  const { data, error } = await client.from(table).select("id, slug");
  if (error) {
    throw new Error(`Unable to resolve ${table} IDs. Verify the approved web migrations are applied.`);
  }

  return new Map(data.map((item) => [item.slug, item.id]));
}

function requireMappedId(idMap, slug, table) {
  const id = idMap.get(slug);
  if (!id) {
    throw new Error(`Missing ${table} record for slug: ${slug}`);
  }
  return id;
}

async function importRecords(client, records) {
  const tables = records.tables;

  await upsertRows(client, "about_sections", tables.about_sections);
  await upsertRows(client, "talent_categories", tables.talent_categories);
  await upsertRows(client, "talents", tables.talents);
  await upsertRows(client, "event_categories", tables.event_categories);
  await upsertRows(client, "events", tables.events);
  await upsertRows(client, "blog_authors", tables.blog_authors);
  await upsertRows(client, "blog_categories", tables.blog_categories);

  const authorIds = await fetchIdMap(client, "blog_authors");
  const blogPosts = tables.blog_posts.map(({ author_slug, ...post }) => ({
    ...post,
    blog_author_id: requireMappedId(authorIds, author_slug, "blog_authors"),
  }));
  await upsertRows(client, "blog_posts", blogPosts);

  const [talentIds, talentCategoryIds, eventIds, eventCategoryIds, blogPostIds, blogCategoryIds] =
    await Promise.all([
      fetchIdMap(client, "talents"),
      fetchIdMap(client, "talent_categories"),
      fetchIdMap(client, "events"),
      fetchIdMap(client, "event_categories"),
      fetchIdMap(client, "blog_posts"),
      fetchIdMap(client, "blog_categories"),
    ]);

  const talentAssignments = tables.talent_category_assignments.map((assignment) => ({
    talent_id: requireMappedId(talentIds, assignment.talent_slug, "talents"),
    talent_category_id: requireMappedId(
      talentCategoryIds,
      assignment.talent_category_slug,
      "talent_categories"
    ),
    is_primary: assignment.is_primary,
    sort_order: assignment.sort_order,
  }));
  const eventAssignments = tables.event_category_assignments.map((assignment) => ({
    event_id: requireMappedId(eventIds, assignment.event_slug, "events"),
    event_category_id: requireMappedId(
      eventCategoryIds,
      assignment.event_category_slug,
      "event_categories"
    ),
    is_primary: assignment.is_primary,
    sort_order: assignment.sort_order,
  }));
  const blogAssignments = tables.blog_post_categories.map((assignment) => ({
    blog_post_id: requireMappedId(blogPostIds, assignment.blog_post_slug, "blog_posts"),
    blog_category_id: requireMappedId(
      blogCategoryIds,
      assignment.blog_category_slug,
      "blog_categories"
    ),
    is_primary: assignment.is_primary,
    sort_order: assignment.sort_order,
  }));

  const assignmentWrites = [
    ["talent_category_assignments", talentAssignments, "talent_id,talent_category_id"],
    ["event_category_assignments", eventAssignments, "event_id,event_category_id"],
    ["blog_post_categories", blogAssignments, "blog_post_id,blog_category_id"],
  ];

  for (const [table, rows, onConflict] of assignmentWrites) {
    if (!rows.length) continue;
    const { error } = await client.from(table).upsert(rows, { onConflict, ignoreDuplicates: false });
    if (error) {
      throw new Error(`Unable to upsert ${table}. Verify the approved web migrations are applied.`);
    }
  }
}

const constants = await loadWebsiteConstants();
const records = transformConstantsToRecords(constants);

if (!shouldApply) {
  logSummary(records, "Dry run only; no Supabase write was attempted");
  console.log(`Use ${APPLY_FLAG} ${CONFIRM_FLAG} only after content review and a database backup.`);
  process.exit(0);
}

if (!isConfirmed) {
  throw new Error(
    `Refusing to write. Production import requires both ${APPLY_FLAG} and ${CONFIRM_FLAG}.`
  );
}

const supabaseUrl = getRequiredEnvironment("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = getRequiredEnvironment("SUPABASE_SERVICE_ROLE_KEY");
const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

await importRecords(client, records);
logSummary(records, "Idempotent draft import completed");
console.log("Review-only media candidates, generated demo media, form defaults, testimonials, merchandise, and cart data were not imported.");
