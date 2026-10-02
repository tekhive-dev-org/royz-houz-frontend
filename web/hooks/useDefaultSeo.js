import { useEffect, useState } from "react";

const FALLBACK_SEO = {
  title: "Royz House | Building Africa's Next Generation",
  description:
    "Building Africa's next generation of creatives, leaders & innovators through talent management, media production, and live entertainment.",
  canonicalPath: "/",
  ogTitle: "Royz House | Building Africa's Next Generation",
  ogDescription:
    "Building Africa's next generation of creatives, leaders & innovators through talent management, media production, and live entertainment.",
  ogImageUrl: "/logo.png",
  noIndex: false,
};

export function useDefaultSeo(initialData) {
  const [seo, setSeo] = useState(initialData || FALLBACK_SEO);
  const [isLoading, setIsLoading] = useState(!initialData);

  async function loadDefaultSeo() {
    try {
      const res = await fetch("/api/seo/default");
      const payload = await res.json();
      if (payload.success && payload.data) {
        setSeo(payload.data);
      }
    } catch {
      // Fallback stays in place
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDefaultSeo();

    function handleRealtimeUpdate(event) {
      const table = event?.detail?.table;
      if (table === "seo_metadata" || table === "site_settings") {
        void loadDefaultSeo();
      }
    }

    window.addEventListener("royz:public-realtime", handleRealtimeUpdate);
    return () => {
      window.removeEventListener("royz:public-realtime", handleRealtimeUpdate);
    };
  }, []);

  return { seo, isLoading };
}
