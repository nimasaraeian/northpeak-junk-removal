import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { site } from "@/content/site";
import { localBusinessSchema, organizationSchema } from "@/lib/schema";

const INSTAGRAM = "https://www.instagram.com/northpeakjunk/";
const X = "https://x.com/northpeakjunk";

test("the live profiles are the defaults, not something env has to supply", () => {
  assert.equal(site.social.instagram, INSTAGRAM);
  assert.equal(site.social.x, X);

  // Accounts that do not exist yet stay empty, so nothing renders a dead link.
  assert.equal(site.social.facebook, "");
  assert.equal(site.social.linkedin, "");
});

test("an env var set to an empty string cannot blank a live profile", () => {
  // `.env.example` ships these keys blank, and `""` is a value `??` would
  // keep. `||` is what makes the default survive being copied from the sample.
  const source = readFileSync("src/content/site.ts", "utf8");
  for (const key of ["NEXT_PUBLIC_INSTAGRAM_URL", "NEXT_PUBLIC_X_URL"]) {
    assert.match(
      source,
      new RegExp(`process\\.env\\.${key}\\s*\\|\\|`),
      `${key} must fall back with || rather than ??`,
    );
  }
});

test("Organization schema names both profiles in sameAs", () => {
  const schema = organizationSchema() as Record<string, unknown>;
  assert.deepEqual(schema.sameAs, [INSTAGRAM, X]);
});

test("sameAs never carries an empty entry", () => {
  for (const schema of [organizationSchema(), localBusinessSchema()] as Array<
    Record<string, unknown>
  >) {
    const sameAs = schema.sameAs as string[] | undefined;
    if (!sameAs) continue;
    for (const url of sameAs) {
      assert.ok(url.startsWith("https://"), `not a profile URL: ${url}`);
    }
  }
});

test("the rest of the Organization schema is unchanged", () => {
  const schema = organizationSchema() as Record<string, unknown>;
  assert.equal(schema["@type"], "Organization");
  assert.equal(schema["@id"], `${site.url}/#organization`);
  assert.equal(schema.name, site.name);
  assert.equal(schema.legalName, site.legalName);
  assert.equal(schema.url, site.url);
  assert.equal(schema.email, site.email);
  assert.equal(schema.telephone, site.phone);
  assert.equal(schema.slogan, site.tagline);
  assert.equal(schema.logo, `${site.url}/brand/favicon-512.png`);
  assert.equal(schema.areaServed, site.areaServed);
  assert.deepEqual(Object.keys(schema).at(-1), "sameAs");
});

test("both footer links open safely in a new tab", () => {
  const source = readFileSync("src/components/layout/SocialLinks.tsx", "utf8");
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noopener noreferrer"/);
  assert.match(source, /aria-label=\{`NorthPeak on \$\{profile\.label\}`\}/);
  // A profile with no URL is skipped rather than rendered pointing nowhere.
  assert.match(source, /filter\(\(profile\) => Boolean\(profile\.href\)\)/);
});
