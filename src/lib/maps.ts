import { site } from "@/content/site";

export function formatSiteAddress() {
  const { streetAddress, addressLocality, addressRegion, postalCode } = site.address;
  return `${streetAddress}, ${addressLocality}, ${addressRegion} ${postalCode}`;
}

export function googleMapsPlaceUrl() {
  const query = encodeURIComponent(formatSiteAddress());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function googleMapsDirectionsUrl() {
  const destination = encodeURIComponent(formatSiteAddress());
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** Embed iframe — lat/lng pin at the tagged address (no API key required). */
export function googleMapsEmbedUrl() {
  const { latitude, longitude } = site.geo;
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=17&hl=en&output=embed`;
}
