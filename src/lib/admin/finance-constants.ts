/**
 * Payroll & accounting enums + labels, in a dependency-light module with NO
 * imports, so client components can use them without pulling Drizzle into the
 * client bundle. The schema re-exports from here.
 */

export const EXPENSE_CATEGORIES = [
  "dump_fee",
  "fuel",
  "supplies",
  "wages",
  "maintenance",
  "marketing",
  "insurance",
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  dump_fee: "Dump / disposal fees",
  fuel: "Fuel",
  supplies: "Supplies",
  wages: "Wages (paid out)",
  maintenance: "Maintenance",
  marketing: "Marketing & ads",
  insurance: "Insurance",
  other: "Other",
};
