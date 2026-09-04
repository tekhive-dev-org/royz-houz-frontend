import { MissionTargetIcon, VisionEyeIcon } from "@/components/about/WhyChooseUs/Icons";
import { toSection } from "./contentAdapter.js";

const SECTION_KEYS = {
  hero: "hero",
  story: "story",
  "why-choose-us": "whyChooseUs",
  "mission-vision": "whyChooseUs",
  "impact-metrics": "whyChooseUs",
  "moments-features": "moments",
  moments: "moments",
  gallery: "gallery",
  testimonials: "testimonials",
};

const MISSION_ICON_MAP = {
  mission: MissionTargetIcon,
  vision: VisionEyeIcon,
};

function toAboutSection(row) {
  const section = toSection(row);
  return { ...section, visible: section.visible !== false };
}

function toMissionVisionCard(card) {
  return {
    ...card,
    icon: MISSION_ICON_MAP[card.iconKey] || MISSION_ICON_MAP[card.id] || MissionTargetIcon,
  };
}

function toGalleryColumns(columns) {
  if (!Array.isArray(columns)) return [];
  return columns.map((column) => (Array.isArray(column) ? column : []));
}

/**
 * Maps serializable About section JSON into the existing components' prop
 * shapes. Icon keys remain data in Supabase and are resolved only in the UI
 * adapter; React components are never persisted.
 */
export function toAboutContent(sections = []) {
  const mappedSections = sections.map(toAboutSection);
  const bySlug = new Map(mappedSections.map((section) => [section.slug, section]));
  const content = {};

  mappedSections.forEach((section) => {
    const key = SECTION_KEYS[section.slug];
    if (key && !content[key]) content[key] = section;
  });

  const missionVision = bySlug.get("mission-vision");
  const impactMetrics = bySlug.get("impact-metrics");
  const momentsFeatures = bySlug.get("moments-features");
  const gallery = bySlug.get("gallery");

  if (missionVision?.cards?.length) {
    content.whyChooseUs = {
      ...(content.whyChooseUs || {}),
      cards: missionVision.cards.map(toMissionVisionCard),
    };
  }

  if (impactMetrics?.metrics?.length) {
    content.whyChooseUs = {
      ...(content.whyChooseUs || {}),
      metrics: impactMetrics.metrics,
    };
  }

  if (momentsFeatures?.features?.length) {
    content.moments = {
      ...(content.moments || {}),
      features: momentsFeatures.features,
    };
  }

  if (gallery?.columns?.length) {
    content.gallery = {
      ...(content.gallery || {}),
      columns: toGalleryColumns(gallery.columns),
    };
  }

  return content;
}

export function isAboutSectionVisible(content, sectionName) {
  return content?.[sectionName]?.visible !== false;
}
