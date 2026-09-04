import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toFooterSection, toNavigationItem, toSocialLink } from "@/adapters/navigationAdapter";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

export async function getNavigation({ client } = {}) {
  const result = await listPublicRecords(getContentClient(client), {
    source: "navigation_items",
    order: { column: "sort_order" },
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(result.data.map(toNavigationItem), "Navigation loaded successfully");
}

export async function getFooter({ client } = {}) {
  const supabase = getContentClient(client);
  const [sections, links, socials] = await Promise.all([
    listPublicRecords(supabase, { source: "footer_sections", order: { column: "sort_order" } }),
    listPublicRecords(supabase, { source: "footer_links", order: { column: "sort_order" } }),
    listPublicRecords(supabase, { source: "social_links", order: { column: "sort_order" } }),
  ]);

  const failed = [sections, links, socials].find((result) => !result.success);
  if (failed) return serviceFailure(failed.error);

  const linksBySection = new Map();
  links.data.forEach((link) => {
    const sectionLinks = linksBySection.get(link.footer_section_id) || [];
    sectionLinks.push(link);
    linksBySection.set(link.footer_section_id, sectionLinks);
  });

  return serviceSuccess(
    {
      sections: sections.data.map((section) => toFooterSection(section, linksBySection.get(section.id) || [])),
      socialLinks: socials.data.map(toSocialLink),
    },
    "Footer content loaded successfully"
  );
}
