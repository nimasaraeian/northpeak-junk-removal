import { locations } from "@/content/locations";
import { services } from "@/content/services";
import { site } from "@/content/site";
import type { Service } from "@/types";

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function organizationId() {
  return `${site.url}/#organization`;
}

function localBusinessId() {
  return `${site.url}/#localbusiness`;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(),
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    slogan: site.tagline,
    logo: `${site.url}/brand/favicon-512.png`,
    areaServed: site.areaServed,
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": localBusinessId(),
    name: site.name,
    image: `${site.url}/brand/favicon-512.png`,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    description: site.description,
    slogan: site.tagline,
    priceRange: "$$",
    currenciesAccepted: "CAD",
    openingHours: "Mo-Su 08:00-18:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.streetAddress,
      addressLocality: site.address.addressLocality,
      addressRegion: site.address.addressRegion,
      postalCode: site.address.postalCode,
      addressCountry: site.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    areaServed: locations.map((location) => ({
      "@type": "City",
      name: location.name,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Junk removal services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          url: `${site.url}/services/${service.slug}`,
        },
      })),
    },
    parentOrganization: { "@id": organizationId() },
  };
}

export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.seoDescription,
    url: `${site.url}/services/${service.slug}`,
    provider: { "@id": localBusinessId() },
    areaServed: site.areaServed,
    brand: { "@id": organizationId() },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
