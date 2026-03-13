# Sales Page Plan — /myynti

Branch: `feature/hidden_sales_page`

## Goal

A hidden sales/booking page for venue organizers. Not in navigation — accessible via direct URL only.

- `/myynti` — lists all productions in the sales collection
- `/myynti/[id]` — full detail page for one production (e.g. `/myynti/hamelnin-pillipiipari`)

Finnish only. No password protection.

---

## New `sales` collection

New folder: `content/sales/`
One YAML file per production, named by production ID.

Example `content/sales/hamelnin-pillipiipari.yaml`:

```yaml
production_id: "hamelnin-pillipiipari"
sort_order: 1
technical_requirements: "..."
price_info: "..."
trailer_url: "..."
documentation_url: ""   # Linkki taltioon (YouTube)
rider_url: ""           # Ladattava rider (PDF, Firebase Storage)
```

The sales collection references a production and stores only fields that are not needed anywhere else (price, technical requirements, trailer, documentation, rider).

---

## Fields moved from productions → sales

These fields are REMOVED from the productions collection and CMS:

| Removed from productions | Now in sales |
|---|---|
| `technical_requirements_fi` + `_en` | `technical_requirements` (fi only) |
| `price_info_fi` + `_en` | `price_info` (fi only) |
| `trailer_url` | `trailer_url` |
| `documentation_url` | `documentation_url` |
| `rider_url` | `rider_url` |

Fields that STAY in productions: everything else, including `duration_fi/en`, `age_recommendation_fi/en`, `is_touring`.

---

## `/myynti/[id].tsx` — detail page content

Reads from both the sales YAML and the referenced production YAML.

From production:
- Hero image (`primary_image`)
- Title (`title_fi`), subtitle (`subtitle_fi`)
- Long description (`long_text_fi`)
- Duration (`duration_fi`) + age recommendation (`age_recommendation_fi`) — spec bar
- Performance images gallery (`production_images`)

From sales:
- Technical requirements (`technical_requirements`)
- Price & travel costs (`price_info`)
- Trailer embed (`trailer_url`)
- Documentation link (`documentation_url`)
- Rider PDF download (`rider_url`)

---

## `kiertueohjelmisto/[id].tsx` — simplified

Simplified to match `ohjelmisto/[id].tsx` style (without performances list and press photos).

Keeps:
- Hero image, title, subtitle
- Long text + info/credits
- Duration + age recommendation spec bar

Removes (moved to /myynti):
- Trailer
- Technical requirements
- Price info
- Documentation link
- Rider download
- Gallery

---

## Files to create/change

| File | Action |
|---|---|
| `content/sales/` | New folder + one YAML per production |
| `src/lib/content.ts` | Add `SalesEntry` type + `getSalesEntries()`, remove 5 field groups from `Production` type |
| `src/pages/myynti.tsx` | New listing page (hidden from nav, Finnish) |
| `src/pages/myynti/[id].tsx` | New detail page (reads sales + production) |
| `src/pages/kiertueohjelmisto/[id].tsx` | Simplify — remove trailer/price/requirements/rider sections |
| `public/admin/config.yml` | Add sales collection, remove moved fields from productions |
