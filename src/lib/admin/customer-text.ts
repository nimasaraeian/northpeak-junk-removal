import { formatCents, type QuoteComputation, type QuoteItemLine } from "@/lib/quote-engine";

/**
 * The "Copy customer text" message.
 *
 * Pure, and deliberately dumb: it takes only what the customer is allowed to
 * see. The internal cost and margin live on a different object entirely, so
 * there is no path by which a template edit could leak them into an SMS.
 *
 * Plain text with no markdown — it is pasted into a phone's message app.
 */

export interface CustomerTextInput {
  customerName: string;
  items: Pick<QuoteItemLine, "label" | "qty">[];
  computation: Pick<
    QuoteComputation,
    "lowCents" | "highCents" | "heavyMode" | "multiLoad" | "loads"
  >;
  heavyMaterial?: string | null;
  /** Falls back to a neutral greeting when empty. */
  operatorName?: string;
}

const MAX_LISTED_ITEMS = 12;

function greeting(name: string): string {
  const trimmed = name.trim();
  return trimmed ? `Hi ${trimmed},` : "Hi,";
}

function itemSummary(items: CustomerTextInput["items"]): string[] {
  const listed = items.slice(0, MAX_LISTED_ITEMS).map((item) => {
    const qty = Math.max(1, Math.floor(item.qty));
    return qty > 1 ? `- ${item.label} x${qty}` : `- ${item.label}`;
  });

  const remaining = items.length - listed.length;
  if (remaining > 0) {
    listed.push(`- plus ${remaining} more item${remaining === 1 ? "" : "s"}`);
  }
  return listed;
}

export function buildCustomerText(input: CustomerTextInput): string {
  const { computation } = input;
  const lines: string[] = [greeting(input.customerName), ""];

  lines.push(
    `Thanks for the details. Based on what you sent us, your junk removal estimate is ${formatCents(
      computation.lowCents,
    )}–${formatCents(computation.highCents)} + GST.`,
  );
  lines.push("");

  if (computation.heavyMode) {
    const material = input.heavyMaterial?.trim();
    lines.push(
      material
        ? `This is priced by weight for ${material}, which is how the disposal facility bills it.`
        : "This is priced by weight, which is how the disposal facility bills heavy material.",
    );
  } else if (input.items.length > 0) {
    lines.push("What we have down for you:");
    lines.push(...itemSummary(input.items));
  }

  if (computation.multiLoad) {
    lines.push("");
    lines.push(
      `This one needs ${computation.loads} truckloads, which is already included in the price above.`,
    );
  }

  lines.push("");
  lines.push(
    "The price covers the crew, all loading, hauling, and disposal and recycling fees. We confirm it with you before we touch anything, and it does not change at the door.",
  );
  lines.push("");
  lines.push("Usable items go to donation first. Happy to book you in whenever suits.");

  const operator = input.operatorName?.trim();
  if (operator) {
    lines.push("");
    lines.push(`— ${operator}, NorthPeak Junk Removal`);
  }

  // Collapse any run of blank lines the branches above may have produced.
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
