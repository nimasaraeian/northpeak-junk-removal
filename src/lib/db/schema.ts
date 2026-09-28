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

export type SettingsRow = typeof settings.$inferSelect;
export type CatalogItemRow = typeof itemsCatalog.$inferSelect;
export type QuoteRow = typeof quotes.$inferSelect;
export type ClientRow = typeof clients.$inferSelect;
export type LeadRow = typeof leads.$inferSelect;
export type JobRow = typeof jobs.$inferSelect;
export type ActivityRow = typeof activityLog.$inferSelect;
