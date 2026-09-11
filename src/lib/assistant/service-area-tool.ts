import { checkServiceArea } from "@/lib/postal";

export function runCheckServiceAreaTool(postalCode: string): string {
  const result = checkServiceArea(postalCode);

  if ("error" in result) {
    return JSON.stringify({ ok: false, error: result.error });
  }

  return JSON.stringify({
    ok: true,
    postalCode: result.postalCode,
    fsa: result.fsa,
    city: result.city ?? null,
    tier: result.tier,
    headline: result.headline,
    message: result.message,
  });
}

export const serviceAreaToolDefinition = {
  type: "function" as const,
  name: "check_service_area",
  description:
    "Check whether NorthPeak currently services a Canadian postal code using official site coverage logic.",
  strict: true as const,
  parameters: {
    type: "object" as const,
    properties: {
      postalCode: {
        type: "string",
        description: "Canadian postal code, e.g. V7L 2A1",
      },
    },
    required: ["postalCode"],
    additionalProperties: false,
  },
};
