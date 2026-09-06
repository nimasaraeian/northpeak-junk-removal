# NorthPeak Junk Removal

Premium junk removal and property recovery for North Vancouver and Greater Vancouver.

**More Space. A Better Tomorrow.**

This repository is the Phase 1 public foundation: website, information architecture, design system, conversion flows, and SEO. It is intentionally structured so a quote engine, customer portal, Supabase backend, and AI-assisted estimates can be added without rebuilding the front of the house.

## Architecture

```
src/
  app/                 App Router pages, metadata, sitemap, robots, OG image
  components/
    brand/             Logo and doorway mark
    layout/            Header and footer
    ui/                Buttons, containers, sections
    home/              Landing page sections
    estimate/          Postal checker and quote wizard
    content/           Shared page chrome
    seo/               JSON-LD
  content/             Services, locations, journal, FAQs, coverage table
  lib/
    postal.ts          Canadian postal validation and service-area rules
    seo.ts             Metadata helper
    schema.ts          Organization, LocalBusiness, Service, FAQ
    actions/           Server actions for estimate and contact
    future/            Supabase seam (not connected yet)
  types/               Shared domain types, including future quote records
```

The site is a Next.js App Router application with TypeScript and Tailwind CSS. Pages stay as Server Components. Interactive pieces (navigation, postal checker, forms) are isolated client components.

Content lives in TypeScript modules rather than a CMS. That is a temporary source of truth. Route slugs are stable so a later CMS or Supabase table can replace the files without changing URLs.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Conversion landing page |
| `/services` | Service hub |
| `/services/[slug]` | Service landing pages |
| `/locations` | Coverage hub + postal checker |
| `/locations/[slug]` | North Vancouver, West Vancouver, Burnaby |
| `/how-it-works` | Process and FAQs |
| `/about` | Brand and company |
| `/contact` | Inquiries |
| `/estimate` | Quote workflow foundation |
| `/blog`, `/blog/[slug]` | SEO journal |

Service slugs: `junk-removal`, `furniture-removal`, `garage-cleanout`, `estate-cleanout`, `commercial-cleanout`, `construction-cleanup`.

Location slugs: `north-vancouver`, `west-vancouver`, `burnaby`, `vancouver`.

## Design system

The visual language comes from the NorthPeak lockup:

- Deep navy for authority
- Warm paper / cream for interiors
- Concrete stone for secondary text
- Orange-gold for action and the doorway light

Typography pairs **Instrument Serif** for display with **Plus Jakarta Sans** for interface copy. The logomark is an opening, not a truck or a recycling symbol.

## SEO strategy

Every page has unique metadata through the Next.js Metadata API. Titles follow `Keyword / Intent | NorthPeak`.

Structured data is rendered as JSON-LD:

- Organization
- LocalBusiness
- Service (on each service page)
- BreadcrumbList
- FAQPage

`sitemap.ts` and `robots.ts` are generated from the same content modules. Internal links run service ↔ location ↔ journal so the target phrases have more than one legitimate URL:

- junk removal North Vancouver
- junk removal Vancouver
- furniture removal Vancouver
- garage cleanout Vancouver
- commercial junk removal Vancouver

Set `NEXT_PUBLIC_SITE_URL` before production so canonicals and the sitemap use the live domain.

## Conversion

Primary CTA: **Get Estimate** → `/estimate`

Secondary CTA: **Check Service Area** → postal checker / `/locations`

The estimate wizard already mirrors the long-term journey:

1. Postal code
2. Service
3. Job notes + reserved photo-upload panel
4. Contact
5. Confirmation

Photos can be selected in the wizard today. They stay in the browser until Supabase Storage is connected. After a successful request, the wizard shows a confirmation state instead of another form.

Coverage is data-driven from `src/content/service-areas.ts` (Canadian FSA prefixes). Core: North Vancouver, West Vancouver, Burnaby. Extended: Vancouver and nearby inner-metro cities.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and replace the public phone, email, and site URL.

```bash
npm run build
npm run start
```

## Future expansion

### Quote engine

Keep `/estimate` as the public entry. Replace `submitEstimate` with a write to `quote_requests`. Add photo uploads to a private Storage bucket from the existing dashed panel. Return an `estimate_min` / `estimate_max` once review or automation has a range.

### Customer portal

Add `/account` behind Supabase Auth. Customers should see request status, booked windows, and uploaded photos. The `QuoteRequestRecord` type already describes the row shape.

### AI assistant

Do not put a model on the public homepage first. Attach it behind the estimate record: photos + description + access notes → suggested range and disposal notes for a human coordinator. The same content layer can later power an on-site assistant.

### CRM

Treat Supabase as the system of record. Sync outward only if a sales CRM is required. Do not fork lead state across tools.

## Decisions

- Content is typed TypeScript, not MDX, so the same objects can feed pages, sitemaps, and schema.
- Service area logic is a table, not hardcoded conditionals in the UI.
- Brand photography is not faked with stock. The gallery is an explicit CMS-ready placeholder.
- Phone and email are environment-driven so the site can launch before operations numbers are final.
