import assert from "node:assert/strict";
import test from "node:test";
import { getPost } from "@/content/blog";
import { indexedLocations, locations } from "@/content/locations";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { GET } from "@/app/llms.txt/route";

const COST_GUIDE = "junk-removal-cost-north-vancouver";

async function body() {
  return GET().text();
}

test("the cost guide this file reads from still exists", async () => {
  const post = getPost(COST_GUIDE);
  assert.ok(post, "the price table's source page is gone");
  assert.ok(
    post.body.some((block) => block.type === "table"),
    "the cost guide no longer carries a price table",
  );
});

test("prices are the cost guide's own table, not a second copy", async () => {
  // This file said a full truck was "$649–1,000+" while the guide's table said
  // "$600–1,000+". An assistant reading both had no way to tell which was the
  // site's position, so the numbers are now read off the guide.
  const text = await body();
  const table = getPost(COST_GUIDE)!.body.find((block) => block.type === "table")!;
  assert.equal(table.type, "table");

  if (table.type !== "table") return;
  for (const [size, range] of table.rows) {
    assert.ok(text.includes(`- ${size}: ${range} CAD`), `missing price row: ${size}`);
  }
  assert.ok(text.includes(`${site.url}/blog/${COST_GUIDE}`), "no link back to the full breakdown");
});

test("hours agree with themselves and with the schema's source", async () => {
  const text = await body();
  assert.ok(
    text.includes(`- Hours: ${site.hours} (${site.opensAt}–${site.closesAt} daily)`),
    "the hours line is not derived from the one set of hours",
  );
  // The line that contradicted itself, hardcoded before the hours were fixed.
  assert.equal(text.includes("typically 08:00–18:00"), false);
});

test("it lists every service and every indexed city, and no de-emphasized one", async () => {
  const text = await body();

  for (const service of services) {
    assert.ok(text.includes(`${site.url}/services/${service.slug}`), service.slug);
  }
  for (const location of indexedLocations) {
    assert.ok(text.includes(`${site.url}/locations/${location.slug}`), location.slug);
  }
  for (const location of locations.filter((item) => item.deEmphasized)) {
    assert.equal(
      text.includes(`${site.url}/locations/${location.slug}`),
      false,
      `${location.slug} is noindex and should not be advertised here`,
    );
  }
});

test("it carries the address and hours an assistant is asked for", async () => {
  const text = await body();
  assert.ok(text.includes(site.address.streetAddress));
  assert.ok(text.includes(site.address.postalCode));
  assert.ok(text.includes(site.phone));
  assert.ok(text.includes(site.email));
});

test("it is served as plain text", async () => {
  const response = GET();
  assert.match(response.headers.get("content-type") ?? "", /^text\/plain/);
});
