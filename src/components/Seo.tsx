// Seo — shared SEO meta tags component.
// Renders title, description, Open Graph, Twitter Card, canonical URL,
// hreflang alternates, and optional JSON-LD structured data.

import Head from "next/head";

const SITE_URL = "https://rimpparemmi.fi";
const SITE_NAME = "Tanssiteatteri Rimpparemmi";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/RRemmi_FUKS_rgb_10Mt.jpeg`;

type SeoProps = {
  title: string;
  description: string;
  path: string;
  locale?: "fi" | "en";
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
};

export default function Seo({
  title,
  description,
  path,
  locale = "fi",
  image,
  type = "website",
  noIndex = false,
  jsonLd,
}: SeoProps) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const enUrl = `${SITE_URL}/en${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const ogLocale = locale === "fi" ? "fi_FI" : "en_US";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* hreflang alternates */}
      <link rel="alternate" hrefLang="fi" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
