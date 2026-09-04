import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import { access } from "node:fs/promises";

/**
 * Node loader hooks that let plain `node --test` import application modules:
 *   - Resolves the project's `@/` alias to absolute file URLs.
 *   - Retries extensionless relative imports (`./common`) with the extensions
 *     the bundler normally adds, because Next.js accepts them but Node ESM
 *     requires explicit file extensions.
 * The hooks file lives at <project>/scripts/tests/alias-hooks.mjs.
 */
const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

function toFileUrl(candidate) {
  return pathToFileURL(join(projectRoot, candidate)).href;
}

// Redirect JSX-containing component modules to plain fixtures so adapter and
// security tests can run under `node --test` without a JSX transform.
const FIXTURE_OVERRIDES = new Map([
  ["@/components/about/WhyChooseUs/Icons", "scripts/tests/fixtures/why-choose-us-icons.js"],
]);

async function resolveAlias(specifier, context, nextResolve) {
  const override = FIXTURE_OVERRIDES.get(specifier);
  if (override) {
    return nextResolve(toFileUrl(override), context);
  }

  const relative = specifier.slice(2);
  const candidates = [relative, `${relative}.js`, `${relative}.mjs`, join(relative, "index.js")];

  for (const candidate of candidates) {
    try {
      return await nextResolve(toFileUrl(candidate), context);
    } catch {
      // Try the next candidate; the last failure is rethrown below.
    }
  }

  return nextResolve(toFileUrl(relative), context);
}

async function resolveRelative(specifier, context, nextResolve) {
  if (!context.parentURL || /\.(js|mjs|cjs|json)$/.test(specifier)) {
    return nextResolve(specifier, context);
  }

  for (const extension of [".js", ".mjs", ".cjs", "/index.js"]) {
    const candidate = new URL(`${specifier}${extension}`, context.parentURL);
    try {
      await access(candidate);
      return await nextResolve(candidate.href, context);
    } catch {
      // Try the next extension; the original resolution error is rethrown.
    }
  }

  return nextResolve(specifier, context);
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) return resolveAlias(specifier, context, nextResolve);
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    return resolveRelative(specifier, context, nextResolve);
  }
  return nextResolve(specifier, context);
}
