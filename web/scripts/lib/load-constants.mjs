import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(new URL("../..", import.meta.url).pathname);

async function importConstantModule(filePath, transformSource = (source) => source) {
  const source = await readFile(resolve(projectRoot, filePath), "utf8");
  const transformedSource = transformSource(source);
  const encodedSource = Buffer.from(transformedSource).toString("base64");

  return import(`data:text/javascript;base64,${encodedSource}`);
}

/**
 * Loads the existing constant modules without modifying them.
 *
 * about.js imports React icon components and talents.js re-exports alias-based
 * helpers. Those presentation-only imports are removed only from the in-memory
 * module source so Node can evaluate the data exports. The transformer never
 * writes to a constants file and ignores non-serializable icon values.
 */
export async function loadWebsiteConstants() {
  const [about, blog, events, media, talentApplication, talentBooking, talents, testimonials, theme] =
    await Promise.all([
      importConstantModule("constants/about.js", (source) =>
        source.replace(
          /^import \{ MissionTargetIcon, VisionEyeIcon \} from "@\/components\/about\/WhyChooseUs\/Icons";\n/,
          "const MissionTargetIcon = null;\nconst VisionEyeIcon = null;\n"
        )
      ),
      importConstantModule("constants/blog.js"),
      importConstantModule("constants/events.js"),
      importConstantModule("constants/media.js"),
      importConstantModule("constants/talentApplication.js"),
      importConstantModule("constants/talentBooking.js"),
      importConstantModule("constants/talents.js", (source) =>
        source.replace(
          /\n\/\/ Re-export helper functions from dedicated utils module for compatibility\nexport \{ getTalentBySlug, getRelatedTalents \} from "@\/utils\/talentHelpers";\s*$/,
          "\n"
        )
      ),
      importConstantModule("constants/testimonials.js"),
      importConstantModule("constants/theme.js"),
    ]);

  return {
    about,
    blog,
    events,
    media,
    talentApplication,
    talentBooking,
    talents,
    testimonials,
    theme,
  };
}

export function getProjectRoot() {
  return projectRoot;
}

export function toFileUrl(relativePath) {
  return pathToFileURL(resolve(projectRoot, relativePath));
}
