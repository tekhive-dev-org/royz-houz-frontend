import Head from "next/head";
import { useRouter } from "next/router";
import { useDefaultSeo } from "@/hooks/useDefaultSeo";

export function DefaultSeo({ initialData }) {
  const router = useRouter();
  const { seo } = useDefaultSeo(initialData);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://royzhouse.com").replace(/\/$/, "");
  const currentPath = router?.asPath?.split("?")[0] || "/";
  const canonicalUrl = `${siteUrl}${currentPath === "/" ? (seo?.canonicalPath || "/") : currentPath}`;

  const title = seo?.title || "Royz House | Building Africa's Next Generation";
  const description =
    seo?.description ||
    "Building Africa's next generation of creatives, leaders & innovators through talent management, media production, and live entertainment.";
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImageUrl
    ? (seo.ogImageUrl.startsWith("http") ? seo.ogImageUrl : `${siteUrl}${seo.ogImageUrl}`)
    : `${siteUrl}/logo.png`;

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <meta key="robots" name="robots" content={seo?.noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* Canonical URL */}
      <link key="canonical" rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content="Royz House" />
      <meta key="og:title" property="og:title" content={ogTitle} />
      <meta key="og:description" property="og:description" content={ogDescription} />
      <meta key="og:image" property="og:image" content={ogImage} />
      <meta key="og:url" property="og:url" content={canonicalUrl} />

      {/* Twitter Cards */}
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={ogTitle} />
      <meta key="twitter:description" name="twitter:description" content={ogDescription} />
      <meta key="twitter:image" name="twitter:image" content={ogImage} />
    </Head>
  );
}

export default DefaultSeo;
