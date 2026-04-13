# SEO Checklist — Tanssiteatteri Rimpparemmi

Domain: `rimpparemmi.fi`
Preview: `rimpparemmi.netlify.app`
Stack: Next.js 15 (Pages Router), Netlify, Decap CMS, Firebase Storage

---

## Current State

### What exists
- [x] Basic `<title>` and `<meta description>` on some pages
- [x] `favicon.ico` (Rimpparemmi circle icon, 32x32)
- [x] FI/EN locale routing (Next.js i18n)
- [x] `lang="fi"` on `<html>`
- [x] Mobile responsive design
- [x] HTTPS (Netlify automatic)
- [x] Images optimized to WebP via Firebase upload pipeline
- [x] H1 tags on pages

### What is missing
- [x] `robots.txt`
- [x] `sitemap.xml` (auto-generated at build time via `scripts/generate-sitemap.js`)
- [x] Open Graph tags (og:title, og:image, etc.) — via shared `Seo` component
- [x] Twitter Card tags — via shared `Seo` component
- [x] Structured data (Schema.org JSON-LD) — PerformingGroup + DanceEvent
- [x] Canonical URLs — via shared `Seo` component
- [x] hreflang tags (FI/EN alternates) — via shared `Seo` component
- [x] `_headers` file (Netlify caching & security)
- [x] OG image (1200x630px) — `public/og-image.png`
- [x] Apple touch icon (180x180px)
- [x] Meta descriptions on all pages — via shared `Seo` component
- [ ] Google Search Console setup

---

## Before Launch

### 1. Technical SEO Files
- [x] Create `public/robots.txt`
- [x] Create `public/sitemap.xml` (auto-generated at build time)
- [ ] Create `public/_headers` (caching, security headers)

### 2. Meta Tags (All Pages) — via shared `Seo` component (`src/components/Seo.tsx`)
- [x] Add `<meta description>` to every page
- [x] Add Open Graph tags (og:title, og:description, og:image, og:url, og:type, og:locale)
- [x] Add Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
- [x] Add canonical URL (`<link rel="canonical">`)
- [x] Add hreflang alternates for FI and EN

### 3. Structured Data (JSON-LD)
- [x] PerformingGroup schema (homepage) — dance theatre company
- [x] DanceEvent schema (production detail pages) — individual shows
- [ ] BreadcrumbList schema (all pages)

### 4. Images
- [x] Create OG image (1200x630px) — Rimpparemmi branding
- [x] Create apple-touch-icon.png (180x180px)
- [ ] Verify all `<Image>` components have descriptive `alt` text
- [x] Replace default favicon with Rimpparemmi circle icon

### 5. Content SEO
- [ ] Verify H1 tag on every page (exactly one per page)
- [ ] Check heading hierarchy (H1 > H2 > H3, no skipping)
- [ ] Descriptive link text (no "click here")
- [x] Production pages have unique meta descriptions

### 6. Performance
- [ ] Test with Google PageSpeed Insights
- [ ] Verify Core Web Vitals (LCP, CLS, INP)
- [ ] Check image loading (lazy loading for below-fold)

---

## Launch Day

### Domain Setup
- [ ] Point `rimpparemmi.fi` DNS to Netlify
- [ ] Verify HTTPS works on final domain
- [ ] Update `sitemap.xml` URLs to `rimpparemmi.fi`
- [ ] Update all canonical/OG URLs to `rimpparemmi.fi`

### Google Search Console
- [ ] Add `rimpparemmi.fi` to Google Search Console
- [ ] Verify ownership (HTML file or DNS TXT record)
- [ ] Submit `sitemap.xml`
- [ ] Request indexing for homepage
- [ ] Request indexing for key pages (ohjelmisto, kalenteri, yhteystiedot)

### Social Media Validation
- [ ] Test OG tags with Facebook Sharing Debugger
- [ ] Test structured data with Google Rich Results Test
- [ ] Share test link on Facebook/WhatsApp to verify preview

---

## Post-Launch

### Week 1
- [ ] Monitor Google Search Console for crawl errors
- [ ] Verify all pages are indexed (Coverage report)
- [ ] Submit to Bing Webmaster Tools (optional)
- [ ] Link from Rimpparemmi social media profiles to website

### Month 1
- [ ] Check search rankings for target keywords
- [ ] Review PageSpeed scores and fix issues
- [ ] Verify structured data appears in search results
- [ ] Add website link to all external profiles and directories

### Ongoing
- [ ] Update `sitemap.xml` when new pages are added
- [ ] Keep meta descriptions current when content changes
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Add new productions to structured data automatically

---

## Target Keywords

### Primary (brand — must rank #1)
- "Tanssiteatteri Rimpparemmi"
- "Rimpparemmi"
- "Rimpparemmi Rovaniemi"

### Secondary (discovery)
- "tanssiteatteri Rovaniemi"
- "tanssi Rovaniemi"
- "tanssiesitys Rovaniemi"
- "Kulttuuritalo Wiljami"
- "dance theatre Rovaniemi" (EN)

### Long-tail (specific shows)
- "[Production name] liput" (e.g. "Hamelnin Pillipiipari liput")
- "[Production name] Rimpparemmi"
- "tanssiesitykset Lappi"
- "lasten tanssiteatteri Rovaniemi"

---

## Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Google Search Console | https://search.google.com/search-console | Indexing, crawl errors, performance |
| PageSpeed Insights | https://pagespeed.web.dev/ | Performance & Core Web Vitals |
| Facebook Debugger | https://developers.facebook.com/tools/debug/ | OG tag testing |
| Rich Results Test | https://search.google.com/test/rich-results | Structured data validation |
| Schema.org Validator | https://validator.schema.org/ | JSON-LD validation |

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Google says "URL not found" | Check correct property selected in Search Console |
| OG image not showing | Clear Facebook cache with Debugger tool, check image is publicly accessible |
| Pages not indexed | Check `robots.txt` isn't blocking, verify sitemap submitted |
| Duplicate content (FI/EN) | hreflang tags tell Google which version to show to which users |
| Old site still in Google | Use URL Removal tool in Search Console |

---

Last updated: 2026-04-13
