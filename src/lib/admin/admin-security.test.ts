import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  checkBackoff,
  FREE_ATTEMPTS,
  lockSecondsFor,
  registerFailure,
} from "@/lib/admin/rate-limit";
import {
  createSessionToken,
  isOperator,
  OPERATORS,
  passwordMatches,
  readSessionToken,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/admin/session";

const PASSWORD = "correct-horse-battery-staple";
const NOW = 1_700_000_000_000;

// --- Session cookie --------------------------------------------------------

test("a freshly issued token reads back as the operator who signed in", () => {
  const token = createSessionToken({ name: "Nima", issuedAt: NOW }, PASSWORD);
  const session = readSessionToken(token, PASSWORD, NOW);

  assert.deepEqual(session, { name: "Nima", issuedAt: NOW });
});

test("both operators round-trip", () => {
  for (const name of OPERATORS) {
    const token = createSessionToken({ name, issuedAt: NOW }, PASSWORD);
    assert.equal(readSessionToken(token, PASSWORD, NOW)?.name, name);
  }
});

test("a token signed with a different password is rejected", () => {
  const token = createSessionToken({ name: "Sina", issuedAt: NOW }, PASSWORD);

  assert.equal(readSessionToken(token, "some-other-password", NOW), null);
});

test("changing the admin password invalidates every live session", () => {
  // The signing key is derived from the password precisely so this holds.
  const token = createSessionToken({ name: "Nima", issuedAt: NOW }, PASSWORD);
  assert.ok(readSessionToken(token, PASSWORD, NOW));
  assert.equal(readSessionToken(token, `${PASSWORD}-rotated`, NOW), null);
});

test("an edited payload no longer verifies", () => {
  const token = createSessionToken({ name: "Sina", issuedAt: NOW }, PASSWORD);
  const [, signature] = token.split(".");

  const forged = Buffer.from(JSON.stringify({ name: "Nima", issuedAt: NOW }), "utf8").toString(
    "base64url",
  );

  assert.equal(readSessionToken(`${forged}.${signature}`, PASSWORD, NOW), null);
});

test("expiry is enforced at seven days", () => {
  const token = createSessionToken({ name: "Nima", issuedAt: NOW }, PASSWORD);

  const justInside = NOW + (SESSION_MAX_AGE_SECONDS - 60) * 1000;
  const justOutside = NOW + (SESSION_MAX_AGE_SECONDS + 60) * 1000;

  assert.ok(readSessionToken(token, PASSWORD, justInside));
  assert.equal(readSessionToken(token, PASSWORD, justOutside), null);
  assert.equal(SESSION_MAX_AGE_SECONDS, 7 * 24 * 60 * 60);
});

test("a token issued well in the future is rejected", () => {
  const token = createSessionToken({ name: "Nima", issuedAt: NOW + 3_600_000 }, PASSWORD);

  assert.equal(readSessionToken(token, PASSWORD, NOW), null);
});

test("malformed tokens are rejected rather than throwing", () => {
  for (const candidate of [
    undefined,
    "",
    ".",
    "no-separator",
    "a.",
    ".b",
    "!!!.???",
    `${Buffer.from("not json").toString("base64url")}.sig`,
  ]) {
    assert.equal(readSessionToken(candidate, PASSWORD, NOW), null, `accepted: ${candidate}`);
  }
});

test("a validly signed token with an unknown operator is rejected", () => {
  // Someone with the key still cannot mint an operator the app does not know.
  const payload = Buffer.from(JSON.stringify({ name: "Mallory", issuedAt: NOW })).toString(
    "base64url",
  );
  const real = createSessionToken({ name: "Nima", issuedAt: NOW }, PASSWORD);
  const signature = real.split(".")[1];

  assert.equal(readSessionToken(`${payload}.${signature}`, PASSWORD, NOW), null);
  assert.equal(isOperator("Mallory"), false);
});

test("the cookie is httpOnly, lax, and scoped to seven days", () => {
  assert.equal(SESSION_COOKIE_OPTIONS.httpOnly, true);
  assert.equal(SESSION_COOKIE_OPTIONS.sameSite, "lax");
  assert.equal(SESSION_COOKIE_OPTIONS.path, "/");
  assert.equal(SESSION_COOKIE_OPTIONS.maxAge, SESSION_MAX_AGE_SECONDS);
});

test("password comparison accepts the right one and rejects everything else", () => {
  assert.equal(passwordMatches(PASSWORD, PASSWORD), true);
  assert.equal(passwordMatches("wrong", PASSWORD), false);
  assert.equal(passwordMatches("", PASSWORD), false);
  // A blank configured password must never match, including against itself.
  assert.equal(passwordMatches("", ""), false);
});

// --- Login backoff ---------------------------------------------------------

test("the first few attempts are free, then the lock grows", () => {
  for (let failures = 1; failures <= FREE_ATTEMPTS; failures += 1) {
    assert.equal(lockSecondsFor(failures), 0, `attempt ${failures} should be free`);
  }
  assert.equal(lockSecondsFor(FREE_ATTEMPTS + 1), 15);
  assert.equal(lockSecondsFor(FREE_ATTEMPTS + 2), 30);
  assert.equal(lockSecondsFor(FREE_ATTEMPTS + 3), 60);
});

test("the lock is capped rather than growing without bound", () => {
  assert.equal(lockSecondsFor(100), 15 * 60);
});

test("a run of failures locks, and the lock lifts on its own", () => {
  let state = undefined as ReturnType<typeof registerFailure> | undefined;
  for (let i = 0; i < FREE_ATTEMPTS; i += 1) {
    state = registerFailure(state, NOW);
    assert.equal(checkBackoff(state, NOW).allowed, true);
  }

  state = registerFailure(state, NOW);
  const locked = checkBackoff(state, NOW);
  assert.equal(locked.allowed, false);
  assert.equal(locked.retryAfterSeconds, 15);

  assert.equal(checkBackoff(state, NOW + 15_000).allowed, true);
});

// --- The panel stays out of the public surface -----------------------------

const repoRoot = process.cwd();

function readSource(relative: string): string {
  return readFileSync(path.join(repoRoot, relative), "utf8");
}

test("robots.txt disallows /admin for every crawler", async () => {
  const robots = (await import("@/app/robots")).default();
  const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];

  assert.ok(rules.length > 0);
  for (const rule of rules) {
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    assert.ok(
      disallow.includes("/admin"),
      `no /admin disallow for ${String(rule.userAgent)}`,
    );
  }
});

test("the sitemap lists nothing under /admin", async () => {
  const sitemap = (await import("@/app/sitemap")).default();

  for (const entry of sitemap) {
    assert.ok(!entry.url.includes("/admin"), `sitemap leaks ${entry.url}`);
  }
});

test("llms.txt never mentions the admin panel", async () => {
  const response = (await import("@/app/llms.txt/route")).GET();
  const body = await response.text();

  assert.ok(body.length > 0);
  assert.equal(body.includes("/admin"), false, "llms.txt names the admin panel");
  assert.equal(/northpeak ops/i.test(body), false, "llms.txt names NorthPeak Ops");
});

test("the proxy sends noindex on admin responses and gates the panel", () => {
  const source = readSource("src/proxy.ts");

  assert.match(source, /X-Robots-Tag/);
  assert.match(source, /noindex/);
  assert.match(source, /\/admin\/:path\*/, "the matcher must cover every admin route");
  assert.match(source, /\/api\/admin\/:path\*/, "the matcher must cover the admin API");
});

test("GA4 is mounted only inside the public site frame", () => {
  // /admin is outside the (site) group, so it cannot inherit the tag. If
  // GoogleAnalytics ever moves back into the root layout, this catches it.
  assert.match(readSource("src/components/layout/SiteFrame.tsx"), /GoogleAnalytics/);
  assert.equal(readSource("src/app/layout.tsx").includes("GoogleAnalytics"), false);
  assert.equal(readSource("src/app/admin/layout.tsx").includes("GoogleAnalytics"), false);
  assert.equal(readSource("src/app/admin/(panel)/layout.tsx").includes("GoogleAnalytics"), false);
});

test("the admin shell pulls in no marketing chrome", () => {
  for (const file of [
    "src/app/admin/layout.tsx",
    "src/app/admin/(panel)/layout.tsx",
    "src/app/admin/not-found.tsx",
  ]) {
    const source = readSource(file);
    for (const forbidden of ["layout/Header", "layout/Footer", "AssistantMount", "SiteFrame"]) {
      assert.equal(source.includes(forbidden), false, `${file} imports ${forbidden}`);
    }
  }
});

test("the panel has its own 404, so notFound() cannot render the public one", () => {
  // /admin/quotes/999 calls notFound(); without this boundary it would fall
  // through to the root not-found, which wraps itself in the site chrome.
  assert.match(readSource("src/app/admin/not-found.tsx"), /export default function/);
  assert.match(readSource("src/app/not-found.tsx"), /SiteChrome/);
  // And a catch-all keeps an unmatched /admin/... URL inside the panel.
  assert.match(
    readSource("src/app/admin/[...unmatched]/page.tsx"),
    /notFound\(\)/,
  );
});

test("the root 404 carries no analytics, so /admin responses carry no GA id", () => {
  // Next serializes the root not-found boundary into every route's payload,
  // /admin included. SiteChrome is the analytics-free half of SiteFrame.
  const notFound = readSource("src/app/not-found.tsx");
  // The module is named SiteFrame.tsx, so match the JSX, not the import path.
  assert.equal(/<SiteFrame[\s/>]/.test(notFound), false, "the root 404 mounts SiteFrame");
  assert.match(notFound, /<SiteChrome>/);

  const frame = readSource("src/components/layout/SiteFrame.tsx");
  const chromeStart = frame.indexOf("export function SiteChrome");
  const frameStart = frame.indexOf("export function SiteFrame");
  assert.ok(chromeStart > 0 && frameStart > chromeStart);
  assert.equal(
    frame.slice(chromeStart, frameStart).includes("GoogleAnalytics"),
    false,
    "SiteChrome must not mount GA4",
  );
  assert.match(frame.slice(frameStart), /GoogleAnalytics/);
});

/** Every server-action module in the panel, so a new one cannot slip the net. */
const ACTION_FILES = [
  "src/lib/admin/actions.ts",
  "src/lib/admin/crm-actions.ts",
  "src/lib/admin/control-actions.ts",
  "src/lib/admin/sms-actions.ts",
];

function exportedActions(file: string): { name: string; source: string }[] {
  const contents = readSource(file);
  return [...contents.matchAll(/export async function (\w+Action)/g)].map((match) => {
    const name = match[1];
    const from = contents.indexOf(`export async function ${name}`);
    const rest = contents.slice(from);
    const end = rest.indexOf("\nexport async function", 1);
    return { name, source: end > 0 ? rest.slice(0, end) : rest };
  });
}

test("the action modules are the ones this test knows about", () => {
  // A third actions file added without being listed here would go unchecked.
  const found = readdirSync(path.join(repoRoot, "src", "lib", "admin"))
    .filter((file) => file.includes("action") && file.endsWith(".ts") && !file.endsWith(".test.ts"))
    .map((file) => `src/lib/admin/${file}`);

  assert.deepEqual(found.sort(), [...ACTION_FILES].sort());
});

test("every mutating admin action re-checks the session for itself", () => {
  // proxy.ts covers Server Function POSTs today, but the Next docs are
  // explicit that a matcher edit can silently drop that coverage.
  let checked = 0;

  for (const file of ACTION_FILES) {
    for (const { name, source } of exportedActions(file)) {
      if (name === "loginAction" || name === "logoutAction") continue;
      assert.match(source, /requireOperator\(\)/, `${file}: ${name} does not check the session`);
      checked += 1;
    }
  }

  assert.ok(checked >= 15, `expected the panel's actions to be found, saw ${checked}`);
});

test("requireOperator is the first thing every CRM action does", () => {
  // Not just present — present before any database call, so a stranger can
  // never cause a write or a read on the way to being rejected.
  for (const { name, source } of exportedActions("src/lib/admin/crm-actions.ts")) {
    const authAt = source.indexOf("requireOperator()");
    const dbAt = source.indexOf("getDb()");
    assert.ok(authAt > 0, `${name} does not check the session`);
    if (dbAt > 0) {
      assert.ok(authAt < dbAt, `${name} reaches the database before checking the session`);
    }
  }
});

test("every status change writes an activity row", () => {
  // The timeline is only trustworthy if nothing can move a record silently.
  const source = readSource("src/lib/admin/crm-actions.ts");

  for (const action of [
    "updateLeadStatusAction",
    "updateJobStatusAction",
    "convertLeadToClientAction",
    "createJobFromQuoteAction",
  ]) {
    const from = source.indexOf(`export async function ${action}`);
    const rest = source.slice(from);
    const end = rest.indexOf("\nexport async function", 1);
    const scoped = end > 0 ? rest.slice(0, end) : rest;

    assert.ok(from > 0, `${action} is missing`);
    assert.match(scoped, /logActivity\(/, `${action} changes state without logging it`);
  }

  // And the two status actions log it as a status change specifically.
  for (const action of ["updateLeadStatusAction", "updateJobStatusAction"]) {
    const from = source.indexOf(`export async function ${action}`);
    const rest = source.slice(from);
    const end = rest.indexOf("\nexport async function", 1);
    assert.match(
      end > 0 ? rest.slice(0, end) : rest,
      /kind: "status_change"/,
      `${action} does not log a status_change`,
    );
  }
});

test("the activity log is append-only from the actions", () => {
  const source = readSource("src/lib/admin/crm-actions.ts");

  assert.equal(
    /update\(activityLog\)|delete\(activityLog\)/.test(source),
    false,
    "the timeline must never be rewritten",
  );
});

test("the vision route checks the session before spending an API call", () => {
  const route = readSource("src/app/api/admin/vision/route.ts");
  const authIndex = route.indexOf("operatorOrNull");
  const clientIndex = route.indexOf("new Anthropic");

  assert.ok(authIndex > 0, "the route must read the session");
  assert.ok(clientIndex > authIndex, "auth must come before the API client is constructed");
});
