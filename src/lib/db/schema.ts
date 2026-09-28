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
 * Three tables, all private to `/admin`. Nothing here is read by a public
 * page, and nothing public is read from here — the marketing site stays a
 * static build with no database at all.
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
});

export type SettingsRow = typeof settings.$inferSelect;
export type CatalogItemRow = typeof itemsCatalog.$inferSelect;
export type QuoteRow = typeof quotes.$inferSelect;
