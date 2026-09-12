import { generalFaqs } from "@/content/faqs";
import { locations } from "@/content/locations";
import { services } from "@/content/services";
import { site, processSteps, trustFactors } from "@/content/site";
import { volumeLevels } from "@/content/truck";
import { assistantActions } from "@/lib/assistant/navigation";

export function buildSiteContext(): string {
  const serviceLines = services.map(
    (service) =>
      `- ${service.name} (${service.slug}): ${service.summary} Items: ${service.items.slice(0, 4).join("; ")}.`,
  );

  const locationLines = locations.map(
    (location) => `- ${location.name}: ${location.summary}`,
  );

  const faqLines = generalFaqs.map((faq) => `- Q: ${faq.question} A: ${faq.answer}`);

  const loadLines = volumeLevels
    .filter((level) => level.id !== "empty")
    .map(
      (level) =>
        `- ${level.label}: ${level.blurb} · ~${level.cubicFeet} cu ft (${level.visitLabel})`,
    );

  const navLines = Object.values(assistantActions).map(
    (action) => `- ${action.label}: ${action.href}`,
  );

  const processLines = processSteps.map((step) => `${step.step}. ${step.title}: ${step.body}`);

  return [
    `Company: ${site.name}`,
    `Tagline: ${site.tagline}`,
    `Description: ${site.description}`,
    `Phone: ${site.phone}`,
    `Email: ${site.email}`,
    `Office: ${site.address.streetAddress}, ${site.address.addressLocality}, ${site.address.addressRegion} ${site.address.postalCode}`,
    `Area served: ${site.areaServed}`,
    `Hours: ${site.hours}`,
    "",
    "Estimate process:",
    ...processLines,
    "",
    "Pricing methodology:",
    "- NorthPeak provides estimate ranges, not instant fixed prices on the website.",
    "- Estimates are based on load size/volume, items, access, and photos when provided.",
    "- Customers can request an estimate at /estimate with postal code, service, description, and optional photos (up to 8).",
    "- Load tiers for reference:",
    ...loadLines,
    "",
    "Services catalog:",
    ...serviceLines,
    "",
    "Locations:",
    ...locationLines,
    "",
    "Trust factors:",
    ...trustFactors.map((item) => `- ${item.title}: ${item.body}`),
    "",
    "FAQs:",
    ...faqLines,
    "",
    "Approved navigation targets (use action keys only):",
    ...navLines,
    "",
    "Hazardous materials:",
    "- Paints, solvents, fuels, certain batteries, and similar hazardous materials require a different channel.",
    "- Do not claim NorthPeak accepts hazardous or specialty regulated materials unless confirmed in this context.",
  ].join("\n");
}
