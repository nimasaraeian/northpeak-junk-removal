# Local SEO playbook

The site work is done and shipped. This is the off-site half — the part that
decides whether NorthPeak appears in the three-result map pack, which is where
most "junk removal north vancouver" traffic actually clicks.

Everything here is copy-paste. Nothing in this file requires a developer.

---

## 1. The one number that matters

**3 Google reviews.** The rating is 5.0, which is excellent. The count is the
problem: established competitors in North Vancouver carry 50–300. Google weighs
both, and count is where we are behind.

Getting from 3 to 25 will move the needle further than any further work on the
website. It is also the slowest thing to build, which is why it starts today
rather than after everything else.

**Target: 25 reviews in 90 days.** At roughly one job a day and a 30% response
rate to a direct ask, that is achievable without buying anything.

### The ask that works

Send it **the same day, within an hour of finishing** — while the empty garage
is still the most satisfying thing they have seen all week. A request sent three
days later converts at a fraction of the rate.

Ask in person first ("if you're happy with it, a Google review really helps a
local crew"), then send the link. The text is a reminder, not the ask.

**SMS** — short enough to read on a lock screen:

> Hi [Name], thanks for having us out today. If the space turned out the way you
> hoped, would you leave us a quick Google review? Takes about a minute and it
> genuinely helps people on the North Shore find us. [REVIEW LINK]
> — [Your name], NorthPeak

**SMS, shorter follow-up** — only if there is no response after 3 days, and only
once:

> Hi [Name], no worries if you're busy — just in case it got buried, here's that
> review link. Thanks again for the work. [REVIEW LINK]

**Email** — subject: `Thanks from NorthPeak — and a small ask`

> Hi [Name],
>
> Thanks again for having us out to [street or neighbourhood] on [day]. [One
> specific sentence about the job — "that garage had more in it than the photos
> suggested" / "glad the sectional came out in one piece".]
>
> If you were happy with how it went, would you mind leaving a Google review?
> It takes a minute, and for a local crew it is genuinely the difference between
> being found and not.
>
> [REVIEW LINK]
>
> Either way, if anything wasn't right, reply to this email and I'll sort it.
>
> [Your name]
> NorthPeak Junk Removal · 564 West Keith Rd, North Vancouver

That last line is not politeness. It gives an unhappy customer somewhere to go
that is not the review form.

### Rules that keep the reviews from being removed

- **Never offer anything in exchange** — no discount, no draw, no gift card.
  Google removes incentivised reviews and can suspend the profile.
- **Never review-gate**: do not ask "were you happy?" first and only send the
  link to the people who say yes. This is against Google's policy.
- **Ask everyone**, including the job that went sideways. A 4.7 with 40 reviews
  outperforms a 5.0 with 3, and a handful of non-perfect reviews reads as real.
- **Do not bulk-send.** A burst of reviews in one day from one location looks
  exactly like what Google filters.

### Reply to every review, within 48 hours

Replies are visible to everyone who reads the listing, and Google treats an
answered profile as an active one.

- *Positive:* name the job, thank them, no boilerplate. "Thanks Karen — that
  Lynn Valley garage was a proper one. Glad you've got the parking back."
- *Negative:* answer once, publicly, without arguing. Acknowledge, state what
  you have changed, and move the conversation to a phone number. Never dispute
  the facts in public, even when you are right.

### Where to get the review link

Google Business Profile dashboard → **Ask for reviews** (visible in the panel in
your screenshot). Copy that short link.

Then hand it to the developer, or set it yourself in the hosting environment:

```
NEXT_PUBLIC_GOOGLE_REVIEW_URL=<the short "Ask for reviews" link>
NEXT_PUBLIC_GOOGLE_PROFILE_URL=<the public listing URL>
```

Once those are set, a review block appears on the homepage and the profile is
declared in the site's structured data as the same business. Until then the site
simply omits those links rather than rendering dead ones.

---

## 2. Fix the profile's hours today

The profile currently says **Open 24 hours**. The real hours are **8:00 AM to
8:00 PM, seven days**, and that is now what the website says in both its copy
and its structured data.

Change it in the profile so all three agree. Two reasons this matters more than
it looks:

1. Google cross-checks the listing against the site. Disagreement costs trust.
2. "Open 24 hours" invites a 3 AM call that nobody answers — and the person who
   is ignored at 3 AM is the person who leaves the one-star review.

---

## 3. Complete the profile

Google's own "Complete info" prompt is on screen for a reason: completeness is a
ranking factor. Work through these in order.

### Primary category

```
Junk removal service
```

Already correct. Do not change it — the primary category carries more weight
than every secondary one combined.

### Secondary categories

Add these, in this order. Only add a category you genuinely serve, because each
one is a claim.

```
Garbage collection service
Waste management service
Debris removal service
Furniture accessories supplier   ← skip unless you actually resell
Demolition contractor            ← only if you do teardown work
```

### Business description (750 character limit)

```
NorthPeak Junk Removal is a local, family-run crew based on West Keith Rd in
North Vancouver. We clear houses, condos, garages, estates, construction sites
and commercial spaces across the North Shore, Vancouver and Burnaby — full
service, which means our crew does all the lifting, loading and hauling from
wherever the items sit.

Estimates are free and quoted from photos before we arrive, so the price is
settled in advance and confirmed again on site before any work starts. Single
items start around $99; most household loads fall between a quarter and a full
truck.

Every load is sorted before disposal: usable furniture and household goods go
to local charities, metal, wood and electronics go to recycling, and only the
remainder goes to the transfer station. Reuse and recycle first, landfill last.
```

### Services

Add each of these with a short description. They mirror the website exactly,
which is the point — consistency across the two is itself a signal.

| Service | Description (copy as-is) |
| --- | --- |
| Junk removal | Full-service removal for homes and businesses. Our crew carries everything out from wherever it sits — no need to move anything to the curb. Priced by truck volume, quoted from photos. |
| Furniture removal | Sofas, sectionals, beds, mattresses, dressers, dining sets and office furniture removed from any floor, including condos with booked elevators. Disassembly included. |
| Garage cleanout | Whole-garage clears in a single visit, swept floor included. A typical single garage is about half a truck; a packed double runs three-quarters to full. |
| Estate cleanout | Whole-property clearing for executors and families, staged over days. Itemized invoices, before-and-after photos and donation receipts available for the estate file. |
| Construction debris removal | Drywall, tile, flooring, framing, cabinetry and fixtures cleared between trades or at the end of a build. Heavy material quoted by weight. |
| Commercial cleanout | Offices, retail units, restaurants and strata common areas. After-hours scheduling, loading bay and freight elevator bookings handled. |
| Mattress removal | Mattresses and box springs taken for recycling, with the per-unit fee included in the quote rather than added afterwards. |
| Appliance removal | Fridges, washers, dryers and stoves, routed to the recycling stream that handles sealed units rather than to landfill. |

### Service areas

Set these, in this order. Do **not** add cities you would decline — an
overstated service area dilutes relevance for the ones that matter.

```
North Vancouver, BC
West Vancouver, BC
Vancouver, BC
Burnaby, BC
```

### Photos — the highest-effort, highest-return item

Google prompted for an exterior photo, and photo count correlates with
engagement more strongly than most owners expect.

- **Exterior:** the truck at the West Keith Rd address, daylight, logo visible.
- **Team:** the crew, faces visible, on an actual job. Not stock.
- **At work:** 10+ shots of real jobs — carrying a sectional down stairs, a
  garage mid-clear, a loaded truck.
- **Before and after:** the single most persuasive format in this trade. Same
  angle, same framing, both shots. Aim for 10 pairs.
- **Logo and cover:** the brand assets already in `public/brand/`.

Shoot with a phone, in daylight, horizontally. Upload a few each week rather
than 40 in one afternoon — steady activity reads as an active business.

### Posts

Post weekly. It takes five minutes and keeps the profile active.

Rotate: a before-and-after from that week · a seasonal note ("spring garage
season — book weekday mornings, they go last") · one FAQ answer lifted straight
from the website · a donation note ("this week's load: three usable sofas to a
North Shore charity").

### Attributes and the rest

Fill in everything the dashboard offers: appointment links, "online estimates",
accessibility, payment methods. Each blank field is a completeness point left on
the table.

---

## 4. Search Console — 10 minutes, do it once

Without it, nobody can tell whether any of this worked.

1. Go to `search.google.com/search-console`, sign in with the same Google
   account that owns the Business Profile.
2. Choose **Domain** property (not URL prefix) and enter `northpeakjunk.com`.
3. Google gives you a TXT record. Add it in your domain registrar's DNS
   settings. Verification usually completes within the hour.
4. Once verified: **Sitemaps** → submit `https://northpeakjunk.com/sitemap.xml`.
5. Under **URL Inspection**, paste the four city pages and the six service pages
   and click **Request Indexing** on each. This does not guarantee speed, but it
   is how you tell Google the pages changed today rather than waiting for a
   recrawl.

Then leave it alone for three weeks. Ranking changes on a site this age take
4–8 weeks to settle; checking daily will only produce noise and bad decisions.

### What to look at after a month

- **Performance → Queries:** which phrases bring impressions. The ones with high
  impressions and low clicks are titles and descriptions worth rewriting.
- **Performance → Pages:** whether the rewritten service and city pages are
  gaining impressions.
- **Business Profile → Performance:** calls, direction requests and website
  clicks from the listing. This is the number that maps to revenue.

---

## 5. Citations — worth an afternoon, not a budget

Google cross-checks the business against other directories. What matters is that
the name, address and phone number are **character-for-character identical**
everywhere.

Use exactly:

```
NorthPeak Junk Removal
564 West Keith Rd, North Vancouver, BC V7M 1M4
+1 (778) 900-5060
https://northpeakjunk.com
```

Free and worth doing, in rough order of value: Apple Business Connect, Bing
Places, Yelp, Yellow Pages Canada, HomeStars, 411.ca, Foursquare, and the North
Vancouver Chamber of Commerce.

Ignore anyone selling "500 citations for $99". Volume from low-quality
directories does nothing, and inconsistent copies of your address actively hurt.

---

## 6. Order of operations

| When | What | Who |
| --- | --- | --- |
| Today | Fix hours to 8 AM–8 PM on the profile | Owner |
| Today | Copy the review link into the hosting env vars | Owner / dev |
| This week | Business description, services, service areas | Owner |
| This week | Search Console verification and sitemap | Owner |
| This week | Exterior and team photos uploaded | Owner |
| Ongoing | Review request after **every** job, same day | Crew |
| Ongoing | Reply to every review within 48 hours | Owner |
| Weekly | One profile post | Owner |
| Month 1 | Citations afternoon | Owner |
| Month 2 | Read Search Console, adjust titles on weak pages | Dev |

The only item on this list that is genuinely hard is the review habit, and it is
also the one that matters most. Everything else is an afternoon.

---

## What deliberately is not here

**Review markup on the website.** The site does not publish an `AggregateRating`
in its structured data, and should not. Self-reported ratings on your own domain
are not counted by Google for a local business, and marking them up invites a
manual action. The reviews live on the profile, which is where they carry
weight; the site links to it.

**Service-by-city landing pages** ("garage cleanout north vancouver",
"furniture removal burnaby", and so on for every combination). The pattern works
when each page is genuinely written, and reads as doorway spam when it is not.
With six services and four cities that is 24 pages of real writing. Worth
revisiting once Search Console shows which combinations people actually search
for — not before.
