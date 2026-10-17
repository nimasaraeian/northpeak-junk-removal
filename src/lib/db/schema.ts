import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  DiscountInput,
  HeavyInput,
  ItemFlag,
  LaborInput,
  PricingSettings,
  QuoteComputation,
} from "@/lib/quote-engine";
import type { BillingSettings } from "@/content/billing";
import type { UserProfile } from "@/lib/admin/user-profile";
import {
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  type InvoiceLineRow,
} from "@/lib/admin/billing-constants";
import { EXPENSE_CATEGORIES } from "@/lib/admin/finance-constants";

// Re-export the dependency-light enums/labels so server code can keep importing
// them from the schema. The arrays live in the constants modules (no Drizzle)
// so client components can use them without pulling Drizzle into their bundle.
export { INVOICE_STATUSES, PAYMENT_METHODS, EXPENSE_CATEGORIES };
export type { InvoiceLineRow };
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/**
 * NorthPeak Ops schema.
 *
 * All private to `/admin`. Nothing here is read by a public page, and the
 * marketing site stays a static build with no database at all — the one
 * exception is `POST /api/leads/intake`, which only ever inserts a lead.
 *
 * v1 shipped settings, items_catalog and quotes. v2 adds the CRM around
 * them: clients, leads, jobs and an activity log, with quotes gaining
 * nullable links to a client and a job so every existing row stays valid.
 */

/** Single-row table. `id` is pinned to 1 by the migration's check constraint. */
export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  pricing: jsonb("pricing").$type<PricingSettings>().notNull(),
  /** Billing & tax overrides (v5). Null falls back to DEFAULT_BILLING_SETTINGS. */
  billing: jsonb("billing").$type<BillingSettings>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  updatedBy: text("updated_by"),
});

export const itemsCatalog = pgTable("items_catalog", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  cubicFeet: real("cubic_feet").notNull(),
  /** Null means "derive the surcharge from `flags`". */
  defaultSurchargeCents: integer("default_surcharge_cents"),
  flags: jsonb("flags").$type<ItemFlag[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
});

export interface QuoteItemLineRow {
  catalogId: number | null;
  custom: boolean;
  label: string;
  qty: number;
  cubicFeetEach: number;
  surchargeCents: number | null;
  flags: ItemFlag[];
}

export type QuoteStatus = "draft" | "sent" | "won" | "lost";

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  /** Operator name from the session — the audit field. */
  createdBy: text("created_by").notNull(),
  customerName: text("customer_name").notNull().default(""),
  customerPhone: text("customer_phone").notNull().default(""),
  customerArea: text("customer_area").notNull().default(""),
  itemLines: jsonb("item_lines").$type<QuoteItemLineRow[]>().notNull().default([]),
  packingPct: integer("packing_pct").notNull(),
  labor: jsonb("labor").$type<LaborInput>().notNull(),
  heavyMode: boolean("heavy_mode").notNull().default(false),
  heavy: jsonb("heavy").$type<HeavyInput | null>(),
  /** Full engine output at save time, so a quote can be read back as quoted. */
  computed: jsonb("computed").$type<QuoteComputation>().notNull(),
  discount: jsonb("discount").$type<DiscountInput | null>(),
  finalLowCents: integer("final_low_cents").notNull(),
  finalHighCents: integer("final_high_cents").notNull(),
  status: text("status").$type<QuoteStatus>().notNull().default("draft"),
  notes: text("notes").notNull().default(""),
  /**
   * CRM links, both nullable so every quote written before v2 stays valid.
   * A quote can exist with no client (a walk-up) and no job (not booked).
   */
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  jobId: integer("job_id"),
});

// --- CRM (v2) --------------------------------------------------------------

export const LEAD_SOURCES = [
  "website_form",
  "google",
  "referral",
  "repeat",
  "ads",
  "walk_in",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "booked",
  "won",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_ORIGINS = ["manual", "website_form", "quote"] as const;
export type LeadOrigin = (typeof LEAD_ORIGINS)[number];

/** Operators, plus the unassigned state. Mirrors OPERATORS in session.ts. */
export const LEAD_OWNERS = ["Nima", "Sina", "unassigned"] as const;
export type LeadOwner = (typeof LEAD_OWNERS)[number];

export const JOB_ASSIGNEES = ["Nima", "Sina", "both", "unassigned"] as const;
export type JobAssignee = (typeof JOB_ASSIGNEES)[number];

export const JOB_STATUSES = ["scheduled", "in_progress", "done", "cancelled"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const ACTIVITY_KINDS = ["note", "status_change", "call", "sms", "system"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export const ACTIVITY_ENTITIES = ["lead", "client", "job", "quote"] as const;
export type ActivityEntity = (typeof ACTIVITY_ENTITIES)[number];

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email"),
  address: text("address"),
  area: text("area").notNull().default(""),
  source: text("source").$type<LeadSource>().notNull().default("other"),
  notes: text("notes").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  /**
   * Maintained rather than computed on read: it is shown in a list of every
   * client, and summing won quotes per row would be a query per row. Written
   * by `recalculateClientValue` whenever a quote of theirs changes.
   */
  lifetimeValueCents: integer("lifetime_value_cents").notNull().default(0),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  /** Null until the lead is converted; a lead is not yet a customer. */
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  area: text("area").notNull().default(""),
  source: text("source").$type<LeadSource>().notNull().default("other"),
  message: text("message").notNull().default(""),
  status: text("status").$type<LeadStatus>().notNull().default("new"),
  owner: text("owner").$type<LeadOwner>().notNull().default("unassigned"),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
  createdFrom: text("created_from").$type<LeadOrigin>().notNull().default("manual"),
  lostReason: text("lost_reason"),
});

export interface JobChecklistItem {
  label: string;
  done: boolean;
}

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  quoteId: integer("quote_id").references(() => quotes.id, { onDelete: "set null" }),
  /** Null means unscheduled — the job sits in the calendar's side rail. */
  scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
  scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),
  assignedTo: text("assigned_to").$type<JobAssignee>().notNull().default("unassigned"),
  status: text("status").$type<JobStatus>().notNull().default("scheduled"),
  address: text("address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  checklist: jsonb("checklist").$type<JobChecklistItem[]>().notNull().default([]),
  /** URLs only. Upload lands in v3; the columns exist so it needs no migration. */
  beforePhotos: jsonb("before_photos").$type<string[]>(),
  afterPhotos: jsonb("after_photos").$type<string[]>(),
});

/**
 * Append-only. Every status change and every note writes one row, which is
 * what makes a lead or client page a timeline rather than a form.
 */
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  entityType: text("entity_type").$type<ActivityEntity>().notNull(),
  entityId: integer("entity_id").notNull(),
  actor: text("actor").notNull(),
  kind: text("kind").$type<ActivityKind>().notNull(),
  body: text("body").notNull().default(""),
});

// --- Control Center (v3) ---------------------------------------------------

/**
 * The owner-approval queue.
 *
 * Every AI-drafted action the panel wants to take — send an estimate, message
 * a customer, publish a post, start an ads campaign — lands here as a row the
 * owner approves, edits, rejects or defers. Nothing leaves the panel on a
 * draft alone. This is the "Owner Control" screen from the product concept,
 * and the heart of the human-in-the-loop model: the software proposes, a
 * person decides.
 */
export const AI_ACTION_KINDS = [
  "send_estimate",
  "send_message",
  "publish_instagram",
  "start_google_ads",
  "intake_summary",
  "marketing_draft",
  "other",
] as const;
export type AiActionKind = (typeof AI_ACTION_KINDS)[number];

export const AI_ACTION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "deferred",
  "blocked",
  "done",
] as const;
export type AiActionStatus = (typeof AI_ACTION_STATUSES)[number];

/** Optional link to the record an action is about. */
export const AI_ACTION_ENTITIES = ["lead", "client", "job", "quote", "none"] as const;
export type AiActionEntity = (typeof AI_ACTION_ENTITIES)[number];

export const aiActions = pgTable("ai_actions", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  kind: text("kind").$type<AiActionKind>().notNull(),
  /** Short human label, e.g. "Send estimate #12 to the customer". */
  title: text("title").notNull(),
  /** One line on what approving it will do. */
  summary: text("summary").notNull().default(""),
  /** The draft itself — message text, estimate id, post body, etc. */
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  status: text("status").$type<AiActionStatus>().notNull().default("pending"),
  /** Set when status is "blocked": why it cannot run yet (e.g. "budget not set"). */
  blockedReason: text("blocked_reason"),
  entityType: text("entity_type").$type<AiActionEntity>().notNull().default("none"),
  entityId: integer("entity_id"),
  /** Which AI role or operator drafted it. */
  createdBy: text("created_by").notNull().default("assistant"),
  decidedBy: text("decided_by"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  /** Owner's note when approving/editing/rejecting/deferring. */
  note: text("note").notNull().default(""),
});

export type SettingsRow = typeof settings.$inferSelect;
export type CatalogItemRow = typeof itemsCatalog.$inferSelect;
export type QuoteRow = typeof quotes.$inferSelect;
export type ClientRow = typeof clients.$inferSelect;
export type LeadRow = typeof leads.$inferSelect;
export type JobRow = typeof jobs.$inferSelect;
export type ActivityRow = typeof activityLog.$inferSelect;
export type AiActionRow = typeof aiActions.$inferSelect;

// --- Team chat (v4) --------------------------------------------------------

/**
 * Internal team chat — operator-to-operator messages inside the cockpit.
 *
 * Never customer-facing. Append-only in practice: the panel only ever inserts
 * and reads. Kept deliberately small (author + body + time); threads, reads
 * and reactions can come later without a breaking change.
 */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  /** Operator name from the session — who wrote it. */
  author: text("author").notNull(),
  body: text("body").notNull(),
});

export type MessageRow = typeof messages.$inferSelect;

// --- Billing & payments (v5) -----------------------------------------------

/**
 * Invoicing + payment tracking.
 *
 * An invoice is the money side of a quote/job: subtotal → GST/PST → total,
 * then one or more `payments` chip away at the balance. Nothing here collects
 * money on its own — `payments` are hand-recorded (cash, e-transfer, card on a
 * terminal, cheque). Online card capture (Stripe) is a Phase 2 integration that
 * would write `payments` rows through the approval queue, no schema change.
 *
 * `status` is the operator-controlled lifecycle; the paid/partial state is
 * derived from the sum of `payments` against `total_cents`, never stored.
 */

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  /** Human invoice number, e.g. NP-0042. Derived from id at creation. */
  number: text("number").notNull().default(""),
  /** CRM links, all nullable: an invoice can be raised on a walk-up with no CRM row. */
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
  quoteId: integer("quote_id").references(() => quotes.id, { onDelete: "set null" }),
  /** Snapshot of the customer, so the invoice reads the same even if the CRM row changes. */
  customerName: text("customer_name").notNull().default(""),
  customerEmail: text("customer_email").notNull().default(""),
  customerPhone: text("customer_phone").notNull().default(""),
  customerAddress: text("customer_address").notNull().default(""),
  lineItems: jsonb("line_items").$type<InvoiceLineRow[]>().notNull().default([]),
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  gstCents: integer("gst_cents").notNull().default(0),
  pstCents: integer("pst_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull().default(0),
  /** Deposit asked for up front; informational, the balance is total − payments. */
  depositCents: integer("deposit_cents").notNull().default(0),
  status: text("status").$type<InvoiceStatus>().notNull().default("draft"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  notes: text("notes").notNull().default(""),
  createdBy: text("created_by").notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  method: text("method").$type<PaymentMethod>().notNull().default("cash"),
  receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
  receivedBy: text("received_by").notNull(),
  note: text("note").notNull().default(""),
});

export type InvoiceRow = typeof invoices.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;

// --- Payroll & accounting (v6) ---------------------------------------------

/**
 * Crew time → pay, plus a simple expense ledger. Together with `payments`
 * these feed the Finance screen's P&L: revenue (payments received) minus
 * labour (time × rate) minus expenses. Deliberately light — this is a
 * two-person shop's books, not a general ledger. QuickBooks sync is Phase 2.
 */

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  /** Free text so contractors beyond Nima/Sina can be paid without a users table. */
  person: text("person").notNull(),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
  /** Calendar day the work happened (date only). */
  workDate: timestamp("work_date", { withTimezone: true }).notNull(),
  hours: real("hours").notNull(),
  /** Hourly pay rate in cents, captured per entry so a rate change is not retroactive. */
  rateCents: integer("rate_cents").notNull(),
  note: text("note").notNull().default(""),
  createdBy: text("created_by").notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expenseDate: timestamp("expense_date", { withTimezone: true }).notNull(),
  category: text("category").$type<ExpenseCategory>().notNull().default("other"),
  amountCents: integer("amount_cents").notNull(),
  vendor: text("vendor").notNull().default(""),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
  note: text("note").notNull().default(""),
  createdBy: text("created_by").notNull(),
});

// --- Sales engine (v7) -----------------------------------------------------

/**
 * One row per phone call, logged from the lead page or the call list.
 *
 * The leads table is deliberately left alone: first-contact time, attempts,
 * the last outcome and the unanswered streak are all derived from these rows
 * (plus the activity log for status changes made before calls were logged),
 * so nothing that already reads `leads` can break on a database that has not
 * run this migration yet.
 */
export const CALL_DIRECTIONS = ["outbound", "inbound"] as const;
export type CallDirection = (typeof CALL_DIRECTIONS)[number];

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  leadId: integer("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  actor: text("actor").notNull(),
  direction: text("direction").$type<CallDirection>().notNull().default("outbound"),
  /** One of `CALL_OUTCOMES` in `lib/admin/sales.ts`. */
  outcome: text("outcome").notNull(),
  notes: text("notes").notNull().default(""),
  flags: jsonb("flags").$type<string[]>().notNull().default([]),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
});

export type CallRow = typeof calls.$inferSelect;

export type TimeEntryRow = typeof timeEntries.$inferSelect;
export type ExpenseRow = typeof expenses.$inferSelect;

// --- Users & roles (v8) ----------------------------------------------------

/**
 * Per-person accounts with roles, replacing the single shared ADMIN_PASSWORD
 * over Phase 2. Until the first user exists, ADMIN_PASSWORD still works, so
 * nobody is ever locked out mid-migration. `password_hash` is scrypt; an
 * invited user has no hash until they accept and set one.
 */
export const USER_ROLES = ["owner", "manager", "sales", "crew"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "invited", "disabled"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").$type<UserRole>().notNull().default("sales"),
  /** scrypt hash ("scrypt$<salt>$<hash>"); null for an invited user not yet accepted. */
  passwordHash: text("password_hash"),
  status: text("status").$type<UserStatus>().notNull().default("active"),
  /** Single-use invite token (and its expiry); set while status is "invited". */
  inviteToken: text("invite_token"),
  inviteExpiresAt: timestamp("invite_expires_at", { withTimezone: true }),
  /** Who sent the invite. Plain column (FK in SQL) to avoid a self-reference type. */
  invitedBy: integer("invited_by"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  /** Full personnel profile (HR, pay, Canada compliance). Null until filled. */
  profile: jsonb("profile").$type<UserProfile>(),
});

export type UserRow = typeof users.$inferSelect;
