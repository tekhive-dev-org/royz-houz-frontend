const ALLOWED_BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "quote",
  "callout",
  "list",
  "listItem",
  "image",
  "embed",
  "divider",
]);

function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").slice(0, 5000);
}

/**
 * Validates and sanitizes a structured article document. The public renderer
 * must only ever render this block schema; arbitrary HTML is never stored or
 * rendered.
 */
export function sanitizeArticleContent(content) {
  if (!Array.isArray(content)) return [];

  const blocks = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    if (!ALLOWED_BLOCK_TYPES.has(block.type)) continue;

    if (block.type === "image" || block.type === "embed") {
      if (typeof block.src !== "string" || !/^https?:\/\//.test(block.src)) continue;
      blocks.push({
        type: block.type,
        src: block.src.slice(0, 2048),
        alt: sanitizeText(block.alt),
        caption: sanitizeText(block.caption),
      });
      continue;
    }

    if (block.type === "callout") {
      blocks.push({
        type: "callout",
        title: sanitizeText(block.title || "Key Takeaway").slice(0, 200),
        text: sanitizeText(block.text),
      });
      continue;
    }

    blocks.push({
      type: block.type,
      text: sanitizeText(block.text),
      level: block.type === "heading" ? Math.min(Math.max(Number(block.level) || 2, 1), 4) : undefined,
    });
  }

  return blocks;
}
