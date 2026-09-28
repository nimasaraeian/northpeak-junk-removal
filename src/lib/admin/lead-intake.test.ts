import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  allowedOrigins,
  checkIntakeRate,
  decideIntake,
  INTAKE_MAX_PER_WINDOW,
  INTAKE_WINDOW_MS,
  intakeSchema,
  isOriginAllowed,
  nextWindow,
  resetIntakeRate,
  secretMatches,
} from "@/lib/admin/lead-intake";
import { insertWebsiteLead } from "@/lib/leads/crm-intake";

const SECRET = "a-long-shared-intake-secret";
const SITE = "https://northpeakjunk.com";

function body(overrides: Record<string, unknown> = {}) {
  return { name: "Dana Reyes", phone: "604-555-0134", area: "North Vancouver", ...overrides };
}

// --- Authentication --------------------------------------------------------

test("a request carrying the right secret is accepted", () => {
  const decision = decideIntake({
    secretHeader: SECRET,
    expectedSecret: SECRET,
    body: body(),
  });

  assert.equal(decision.ok, true);
  assert.equal(decision.ok && decision.lead.name, "Dana Reyes");
});

test("a request with no secret header is rejected 401", () => {
  const decision = decideIntake({ secretHeader: null, expectedSecret: SECRET, body: body() });

  assert.equal(decision.ok, false);
  assert.equal(decision.ok === false && decision.status, 401);
});

test("a request with the wrong secret is rejected 401", () => {
  for (const wrong of ["", "nope", `${SECRET}x`, SECRET.slice(0, -1), SECRET.toUpperCase()]) {
    const decision = decideIntake({
      secretHeader: wrong,
      expectedSecret: SECRET,
      body: body(),
    });
    assert.equal(decision.ok, false, `accepted "${wrong}"`);
    assert.equal(decision.ok === false && decision.status, 401);
  }
});

test("with no secret configured the endpoint is closed, not open", () => {
  // The dangerous failure mode would be treating "unset" as "no auth needed".
  for (const candidate of [null, "", "anything"]) {
    const decision = decideIntake({
      secretHeader: candidate,
      expectedSecret: undefined,
      body: body(),
    });
    assert.equal(decision.ok, false);
    assert.equal(decision.ok === false && decision.status, 503);
  }
});

test("the secret is checked before the body, so a stranger learns nothing", () => {
  // Garbage body plus wrong secret must report the auth failure, not the
  // validation one — otherwise the endpoint becomes a schema oracle.
  const decision = decideIntake({
    secretHeader: "wrong",
    expectedSecret: SECRET,
    body: { nonsense: true },
  });

  assert.equal(decision.ok === false && decision.status, 401);
});

test("secretMatches is total: never throws, never true by accident", () => {
  assert.equal(secretMatches(null, SECRET), false);
  assert.equal(secretMatches(SECRET, undefined), false);
  assert.equal(secretMatches("", ""), false);
  assert.equal(secretMatches(SECRET, SECRET), true);
});

// --- Payload validation ----------------------------------------------------

test("a valid body keeps its fields and defaults the rest", () => {
  const parsed = intakeSchema.parse({ name: "Dana" });

  assert.equal(parsed.name, "Dana");
  assert.equal(parsed.phone, "");
  assert.equal(parsed.email, "");
  assert.equal(parsed.area, "");
  assert.equal(parsed.message, "");
  assert.equal(parsed.source, undefined);
});

test("a body with no name is rejected 400", () => {
  for (const bad of [{}, { name: "" }, { name: "   " }, null, "a string", 42]) {
    const decision = decideIntake({ secretHeader: SECRET, expectedSecret: SECRET, body: bad });
    assert.equal(decision.ok, false, `accepted ${JSON.stringify(bad)}`);
    assert.equal(decision.ok === false && decision.status, 400);
  }
});

test("oversized fields are rejected rather than truncated into the database", () => {
  const decision = decideIntake({
    secretHeader: SECRET,
    expectedSecret: SECRET,
    body: body({ message: "x".repeat(4001) }),
  });

  assert.equal(decision.ok === false && decision.status, 400);
});

test("whitespace is trimmed, so a padded form field does not become the name", () => {
  const decision = decideIntake({
    secretHeader: SECRET,
    expectedSecret: SECRET,
    body: body({ name: "  Dana Reyes  " }),
  });

  assert.equal(decision.ok && decision.lead.name, "Dana Reyes");
});

test("an unknown source is rejected rather than silently stored", () => {
  const decision = decideIntake({
    secretHeader: SECRET,
    expectedSecret: SECRET,
    body: body({ source: "carrier_pigeon" }),
  });

  assert.equal(decision.ok === false && decision.status, 400);
});

test("a known source is carried through", () => {
  const decision = decideIntake({
    secretHeader: SECRET,
    expectedSecret: SECRET,
    body: body({ source: "referral" }),
  });

  assert.equal(decision.ok && decision.lead.source, "referral");
});

// --- Rate limiting ---------------------------------------------------------

test("the window allows a burst and then closes", () => {
  let window = undefined;
  for (let i = 1; i <= INTAKE_MAX_PER_WINDOW; i += 1) {
    const result = nextWindow(window, 1_000);
    assert.equal(result.allowed, true, `submission ${i} should be allowed`);
    window = result.window;
  }

  const overflow = nextWindow(window, 1_000);
  assert.equal(overflow.allowed, false);
  assert.ok(overflow.retryAfterSeconds > 0);
});

test("the window reopens once it has elapsed", () => {
  const exhausted = { windowStart: 1_000, count: INTAKE_MAX_PER_WINDOW + 5 };

  assert.equal(nextWindow(exhausted, 1_000 + INTAKE_WINDOW_MS - 1).allowed, false);
  assert.equal(nextWindow(exhausted, 1_000 + INTAKE_WINDOW_MS).allowed, true);
});

test("callers are limited separately", () => {
  resetIntakeRate();

  for (let i = 0; i < INTAKE_MAX_PER_WINDOW; i += 1) checkIntakeRate("1.1.1.1", 5_000);
  assert.equal(checkIntakeRate("1.1.1.1", 5_000).allowed, false);
  assert.equal(checkIntakeRate("2.2.2.2", 5_000).allowed, true, "a second caller is unaffected");

  resetIntakeRate();
  assert.equal(checkIntakeRate("1.1.1.1", 5_000).allowed, true, "reset clears the counter");
});

// --- CORS ------------------------------------------------------------------

test("our own origin is allowed and a stranger's is not", () => {
  assert.equal(isOriginAllowed("https://northpeakjunk.com", SITE), true);
  assert.equal(isOriginAllowed("https://evil.example", SITE), false);
  assert.equal(isOriginAllowed("http://northpeakjunk.com", SITE), false, "scheme matters");
});

test("a server-to-server call sends no Origin and is unaffected", () => {
  assert.equal(isOriginAllowed(null, SITE), true);
});

test("a malformed site URL does not take the endpoint down", () => {
  assert.deepEqual(allowedOrigins("not a url").includes("https://northpeakjunk.com"), false);
  assert.doesNotThrow(() => isOriginAllowed("https://x.example", "not a url"));
});

// --- The route wires those decisions up ------------------------------------

const ROUTE = readFileSync(
  path.join(process.cwd(), "src", "app", "api", "leads", "intake", "route.ts"),
  "utf8",
);

test("the route is public by design and lives outside the admin matcher", () => {
  const proxy = readFileSync(path.join(process.cwd(), "src", "proxy.ts"), "utf8");

  // /api/leads/* is deliberately not gated — but it must also not be
  // accidentally swept into the admin matcher, which would 401 the website.
  assert.equal(proxy.includes("/api/leads"), false);
  assert.match(proxy, /\/api\/admin\/:path\*/);
});

test("the route checks the secret before it touches the database", () => {
  const decideAt = ROUTE.indexOf("decideIntake");
  const insertAt = ROUTE.indexOf("insertWebsiteLead(");

  assert.ok(decideAt > 0 && insertAt > 0);
  assert.ok(decideAt < insertAt, "the database must not be reached before the secret is checked");
});

test("the route rate-limits before doing any work", () => {
  const rateAt = ROUTE.indexOf("checkIntakeRate");
  const jsonAt = ROUTE.indexOf("request.json()");

  assert.ok(rateAt > 0 && rateAt < jsonAt, "rate limiting must come before body parsing");
});

const CONNECTOR = readFileSync(
  path.join(process.cwd(), "src", "lib", "leads", "crm-intake.ts"),
  "utf8",
);

test("an intake lead is written as a new website lead and nothing else", () => {
  assert.match(ROUTE, /origin: "website_form"/);
  assert.match(CONNECTOR, /status: "new"/);
  assert.match(CONNECTOR, /owner: "unassigned"/);
  // It inserts; it must never update or delete anything.
  for (const source of [ROUTE, CONNECTOR]) {
    assert.equal(/\.update\(/.test(source), false, "intake must not update anything");
    assert.equal(/\.delete\(/.test(source), false, "intake must not delete anything");
  }
});

test("arriving from the website writes an activity row", () => {
  assert.match(CONNECTOR, /activityLog/);
  assert.match(CONNECTOR, /entityType: "lead"/);
});

test("both doors into the pipeline run the same insert", () => {
  // The API route and the estimate form must produce the same row, so both
  // go through insertWebsiteLead rather than each writing their own.
  const submitCore = readFileSync(
    path.join(process.cwd(), "src", "lib", "estimate", "submit-core.ts"),
    "utf8",
  );

  assert.match(ROUTE, /insertWebsiteLead\(/);
  assert.match(submitCore, /dispatchCrmLead\(/);
  assert.match(CONNECTOR, /export async function insertWebsiteLead/);
  assert.match(CONNECTOR, /export function dispatchCrmLead/);
  // The estimate form writes no lead row of its own.
  assert.equal(/insert\(leads\)/.test(submitCore), false);
});

test("the estimate form cannot be failed by the CRM", () => {
  const submitCore = readFileSync(
    path.join(process.cwd(), "src", "lib", "estimate", "submit-core.ts"),
    "utf8",
  );

  // Never awaited, so a slow or broken database cannot hold up a customer.
  assert.equal(
    /await dispatchCrmLead/.test(submitCore),
    false,
    "dispatchCrmLead must stay fire-and-forget",
  );
  // And it is scheduled after the result is already decided — same position
  // as the existing lead webhook.
  assert.ok(
    submitCore.indexOf("dispatchLeadWebhook(") < submitCore.indexOf("dispatchCrmLead("),
    "the CRM dispatch belongs beside the webhook, after delivery is confirmed",
  );
});

test("with no database configured the connector is a no-op, not a crash", () => {
  // Mirrors the lead webhook's "unset URL means do nothing" contract, and is
  // why calling it from a unit test with no request scope is safe.
  assert.match(CONNECTOR, /if \(!isDatabaseConfigured\(\)\) return;/);
  const guardAt = CONNECTOR.indexOf("if (!isDatabaseConfigured()) return;");
  const afterAt = CONNECTOR.indexOf("after(async", guardAt);
  assert.ok(guardAt > 0 && afterAt > guardAt, "the guard must precede after()");
});

test("insertWebsiteLead reports failure instead of throwing", async () => {
  // No DATABASE_URL in the test environment, so this exercises the null-db
  // path: a CRM write must never throw into a caller on the public path.
  const result = await insertWebsiteLead({
    name: "Dana",
    phone: "",
    email: "",
    area: "",
    message: "",
    source: "website_form",
    origin: "website_form",
  });

  assert.equal(result.ok, false);
  assert.equal(typeof result.error, "string");
});
