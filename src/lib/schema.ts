import { locations } from "@/content/locations";
import { services } from "@/content/services";
import { site } from "@/content/site";
import type { BlogPost, LocationPage, Service } from "@/types";

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Profile URLs that are actually configured.
 *
 * `sameAs` is how a search engine ties this site to the accounts that post
 * under the same name. An empty entry is a broken entity link rather than a
 * neutral one, so unconfigured profiles are filtered out and `sameAs` is
 * omitted entirely when none are set.
 */
function socialProfiles() {
  return [...Object.values(site.social), site.google.profileUrl].filter(
    (url): url is string => Boolean(url),
  );
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
    ...(socialProfiles().length > 0 ? { sameAs: socialProfiles() } : {}),
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
    // `openingHours` is a free-text string a parser has to interpret;
    // `openingHoursSpecification` is the typed form Google reads for the
    // "open now" state in a local result. Both are emitted, because the string
    // form is still what some older consumers look for.
    openingHours: "Mo-Su 08:00-18:00",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "18:00",
    },
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
    // `sameAs` lives on Organization alone, by decision. The two nodes are one
    // business under two @ids, so repeating the profile links here would be
    // accurate but redundant; Organization is the entity search resolves to.
  };
}

export function locationServiceSchema(location: LocationPage) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Junk Removal ${location.name}`,
    serviceType: "Junk Removal",
    description: location.seoDescription,
    url: `${site.url}/locations/${location.slug}`,
    // Same `@id` as the site-wide LocalBusiness node, so this is the one
    // business described twice rather than two businesses. Repeating the
    // address here keeps the served city and the yard it is served from in a
    // single block, which is what a location page is claiming.
    provider: {
      "@type": "LocalBusiness",
      "@id": localBusinessId(),
      name: site.name,
      url: site.url,
      telephone: site.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.streetAddress,
        addressLocality: site.address.addressLocality,
        addressRegion: site.address.addressRegion,
        postalCode: site.address.postalCode,
        addressCountry: site.address.addressCountry,
      },
    },
    areaServed: {
      "@type": "City",
      name: location.name,
    },
    brand: { "@id": organizationId() },
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

/**
 * The services hub is a list page, not a service. Saying so explicitly gives
 * it a purpose of its own rather than leaving it to read as a stack of
 * summaries already published on the pages it links to.
 */
export function serviceListSchema() {
  const url = `${site.url}/services`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: "Junk Removal Services",
    description: site.description,
    isPartOf: { "@id": organizationId() },
    about: { "@id": localBusinessId() },
    mainEntity: {
      "@type": "ItemList",
      name: "NorthPeak service lines",
      numberOfItems: services.length,
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: service.name,
        url: `${site.url}/services/${service.slug}`,
      })),
    },
  };
}

export function articleSchema(post: BlogPost) {
  const url = `${site.url}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      "@id": organizationId(),
      name: site.name,
      url: site.url,
    },
    publisher: { "@id": organizationId() },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
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
