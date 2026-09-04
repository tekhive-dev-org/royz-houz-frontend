import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

let cachedData = {
  navigation: null,
  socialLinks: null,
  footerSections: null,
  contactInfo: null,
};
let isFetching = false;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(cachedData));
}

async function fetchGlobalLayoutData() {
  if (isFetching) return;
  isFetching = true;

  try {
    const supabase = getSupabaseBrowserClient();
    const [navRes, socialRes, footerSecRes, footerLinkRes, contactRes] = await Promise.all([
      supabase.from("navigation_items").select("*").order("sort_order"),
      supabase.from("social_links").select("*").order("sort_order"),
      supabase.from("footer_sections").select("*").order("sort_order"),
      supabase.from("footer_links").select("*").order("sort_order"),
      supabase.from("site_settings").select("*").eq("slug", "contact-info").maybeSingle(),
    ]);

    const nav = navRes?.data && navRes.data.length > 0 ? navRes.data : null;
    const socials = socialRes?.data && socialRes.data.length > 0 ? socialRes.data : null;
    const contact = contactRes?.data?.content || null;

    let sections = null;
    if (footerSecRes?.data && footerSecRes.data.length > 0) {
      const linksBySection = new Map();
      (footerLinkRes?.data || []).forEach((link) => {
        const arr = linksBySection.get(link.footer_section_id) || [];
        arr.push(link);
        linksBySection.set(link.footer_section_id, arr);
      });
      sections = footerSecRes.data.map((sec) => ({
        ...sec,
        links: linksBySection.get(sec.id) || [],
      }));
    }

    if (nav || socials || contact || sections) {
      cachedData = {
        navigation: nav || cachedData.navigation,
        socialLinks: socials || cachedData.socialLinks,
        footerSections: sections || cachedData.footerSections,
        contactInfo: contact || cachedData.contactInfo,
      };
      notifyListeners();
      isFetching = false;
      return;
    }
  } catch {
    // Attempt fallback via local API routes
  }

  // Fallback to internal same-origin Next.js endpoints
  try {
    const [navRes, footerRes] = await Promise.all([
      fetch("/api/site/navigation").then((r) => r.json()).catch(() => null),
      fetch("/api/site/footer").then((r) => r.json()).catch(() => null),
    ]);

    const nav = navRes?.success && navRes.data?.length ? navRes.data : null;
    const socials = footerRes?.success && footerRes.data?.socialLinks?.length ? footerRes.data.socialLinks : null;
    const sections = footerRes?.success && footerRes.data?.sections?.length ? footerRes.data.sections : null;

    if (nav || socials || sections) {
      cachedData = {
        navigation: nav || cachedData.navigation,
        socialLinks: socials || cachedData.socialLinks,
        footerSections: sections || cachedData.footerSections,
        contactInfo: cachedData.contactInfo,
      };
      notifyListeners();
    }
  } catch {
    // Fail gracefully
  } finally {
    isFetching = false;
  }
}

/**
 * Hook to retrieve live published global layout content (navigation, social links,
 * footer sections/links, contact information) from Supabase with shared in-memory caching.
 */
export function useGlobalLayout() {
  const [data, setData] = useState(cachedData);

  useEffect(() => {
    listeners.add(setData);
    if (!cachedData.navigation && !cachedData.socialLinks && !cachedData.contactInfo) {
      void fetchGlobalLayoutData();
    }
    return () => {
      listeners.delete(setData);
    };
  }, []);

  return data;
}
