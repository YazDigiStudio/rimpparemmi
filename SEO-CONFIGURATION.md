# SEO Configuration Guide — Tanssiteatteri Rimpparemmi

Technical implementation guide for SEO on this Next.js 15 / Netlify site.

---

## 1. Meta Tags & Open Graph

### Implementation approach
Next.js Pages Router uses `<Head>` from `next/head` in each page component. Create a shared SEO component to avoid duplication.

### Shared SEO component
Create `src/components/Seo.tsx` that accepts per-page props and renders all meta tags:

```tsx
type SeoProps = {
  title: string;
  description: string;
  path: string;           // e.g. "/ohjelmisto"
  image?: string;         // OG image URL, defaults to site-wide OG image
  type?: string;          // "website" | "article", defaults to "website"
  locale?: "fi" | "en";
};
```

Tags to render:
- `<title>`
- `<meta name="description">`
- `<link rel="canonical" href="https://rimpparemmi.fi{path}">`
- `<meta property="og:title">`
- `<meta property="og:description">`
- `<meta property="og:url">`
- `<meta property="og:image">` (absolute URL)
- `<meta property="og:type">`
- `<meta property="og:locale" content="fi_FI">` or `"en_US"`
- `<meta property="og:site_name" content="Tanssiteatteri Rimpparemmi">`
- `<meta name="twitter:card" content="summary_large_image">`
- `<meta name="twitter:title">`
- `<meta name="twitter:description">`
- `<meta name="twitter:image">`

### hreflang tags
Add to every page for FI/EN alternate versions:
```html
<link rel="alternate" hreflang="fi" href="https://rimpparemmi.fi{path}" />
<link rel="alternate" hreflang="en" href="https://rimpparemmi.fi/en{path}" />
<link rel="alternate" hreflang="x-default" href="https://rimpparemmi.fi{path}" />
```

### Domain config
Use an environment variable or constant for the base URL:
```
NEXT_PUBLIC_SITE_URL=https://rimpparemmi.fi
```
Before DNS is pointed, use `https://rimpparemmi.netlify.app`.

---

## 2. Structured Data (Schema.org JSON-LD)

### Homepage: PerformingGroup
Describes the dance theatre company. Add as `<script type="application/ld+json">` in the homepage `<Head>`.

```json
{
  "@context": "https://schema.org",
  "@type": "PerformingGroup",
  "name": "Tanssiteatteri Rimpparemmi",
  "alternateName": "Dance Theatre Rimpparemmi",
  "url": "https://rimpparemmi.fi",
  "logo": "https://rimpparemmi.fi/images/RRemmi_FUKS_rgb_10Mt.jpeg",
  "description": "Tanssiteatteri Rimpparemmi on Suomen pohjoisin ammattitanssiteatteri Rovaniemella.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Hallituskatu 20 A",
    "addressLocality": "Rovaniemi",
    "postalCode": "96100",
    "addressCountry": "FI"
  },
  "location": {
    "@type": "PerformingArtsTheater",
    "name": "Kulttuuritalo Wiljami",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hallituskatu 20 A",
      "addressLocality": "Rovaniemi",
      "postalCode": "96100",
      "addressCountry": "FI"
    }
  },
  "sameAs": [
    "https://www.facebook.com/rimpparemmi",
    "https://www.instagram.com/rimpparemmi"
  ]
}
```

### Production pages: Event schema
Each production page (`/ohjelmisto/[id]`) can include Event structured data for upcoming performances. Generate dynamically from CMS data.

```json
{
  "@context": "https://schema.org",
  "@type": "DanceEvent",
  "name": "Hamelnin Pillipiipari",
  "startDate": "2026-04-14T09:30:00+03:00",
  "location": {
    "@type": "PerformingArtsTheater",
    "name": "Kulttuuritalo Wiljami",
    "address": { ... }
  },
  "performer": {
    "@type": "PerformingGroup",
    "name": "Tanssiteatteri Rimpparemmi"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://www.netticket.fi/hamelnin-pillipiipari-rovaniemi"
  }
}
```

---

## 3. robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://rimpparemmi.fi/sitemap.xml
```

This allows search engines to crawl all public pages but blocks the CMS admin panel and API routes.

---

## 4. sitemap.xml

Create `public/sitemap.xml` with all static pages. Update when adding new pages.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>https://rimpparemmi.fi/</loc>
    <xhtml:link rel="alternate" hreflang="fi" href="https://rimpparemmi.fi/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://rimpparemmi.fi/en/" />
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/ohjelmisto</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/kalenteri</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/yhteystiedot</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/tanssiteatteri</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/ihmiset</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/saapuminen</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/media</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/kiertueohjelmisto</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://rimpparemmi.fi/tietosuojaseloste</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>

</urlset>
```

### Dynamic sitemap (future improvement)
Production pages (`/ohjelmisto/[id]`) are generated from CMS data. For full coverage, consider generating `sitemap.xml` at build time using `getStaticPaths` data. For now, the most important pages are listed statically.

---

## 5. Netlify Headers

Create `public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/images/*
  Cache-Control: public, max-age=31536000, immutable

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## 6. OG Image

### Requirements
- Size: 1200x630px
- Format: JPG or PNG
- Location: `public/og-image.jpg`
- Content: Rimpparemmi logo/branding, readable at small size

### Per-production OG images
Each production has a `primary_image` in CMS. Use this as the OG image for production pages. The shared Seo component accepts an `image` prop for this.

---

## 7. Page-by-Page Meta Content

| Page | Title (FI) | Description (FI) |
|------|-----------|-------------------|
| Etusivu | Tanssiteatteri Rimpparemmi - Rovaniemen ammattitanssiteatteri | Tanssiteatteri Rimpparemmi on Suomen pohjoisin ammattitanssiteatteri. Tanssiesityksiä Kulttuuritalo Wiljamissa Rovaniemella. |
| Ohjelmisto | Ohjelmisto - Tanssiteatteri Rimpparemmi | Tanssiteatteri Rimpparemmin esitykset ja tuotannot. Katso ohjelmisto ja osta liput. |
| Kalenteri | Kalenteri & liput - Tanssiteatteri Rimpparemmi | Tanssiteatteri Rimpparemmin esityskalenteri. Katso tulevat esitykset ja osta liput. |
| Yhteystiedot | Yhteystiedot - Tanssiteatteri Rimpparemmi | Tanssiteatteri Rimpparemmin yhteystiedot. Hallituskatu 20 A, 96100 Rovaniemi. |
| Tanssiteatteri | Tanssiteatteri - Rimpparemmi | Tietoa Tanssiteatteri Rimpparemmista, Suomen pohjoisimmasta ammattitanssiteatterista. |
| Ihmiset | Ihmiset - Tanssiteatteri Rimpparemmi | Tanssiteatteri Rimpparemmin henkilökunta ja taiteilijat. |
| Saapuminen | Saapuminen - Kulttuuritalo Wiljami | Saapumisohjeet Kulttuuritalo Wiljamiin, Hallituskatu 20 A, Rovaniemi. |
| Media | Media - Tanssiteatteri Rimpparemmi | Tanssiteatteri Rimpparemmin mediasisältö: videot, kuvat ja lehdistömateriaali. |
| Kiertueohjelmisto | Kiertueohjelmisto - Tanssiteatteri Rimpparemmi | Tanssiteatteri Rimpparemmin kiertueohjelmisto. Tilaa esitys omaan tapahtumaasi. |
| Production pages | [Title] - Tanssiteatteri Rimpparemmi | Dynamic: use `short_text_fi` from CMS |

English versions follow the same pattern with EN translations.

---

## 8. Implementation Order

Recommended order for implementing SEO:

1. **`robots.txt` + `sitemap.xml`** — quick wins, drop files in `public/`
2. **Seo component** — shared component for meta/OG/canonical/hreflang
3. **Add Seo to all pages** — replace existing `<Head>` content
4. **Structured data** — PerformingGroup on homepage, DanceEvent on productions
5. **`_headers`** — caching and security
6. **OG image** — create and place in `public/`
7. **Google Search Console** — setup after domain is live
8. **Test everything** — use tools from checklist

---

Last updated: 2026-04-13
