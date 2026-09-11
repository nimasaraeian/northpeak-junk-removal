"use client";

import Image from "next/image";
import type { Route } from "next";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { featuredServices } from "@/content/services";
import { Container } from "@/components/ui/Container";
import { cx } from "@/lib/utils";

const serviceImages: Record<string, string> = {
  "furniture-removal": "/services/furniture.jpg",
  "garage-cleanout": "/services/garage.jpg",
  "estate-cleanout": "/services/estate.jpg",
  "construction-cleanup": "/services/construction.jpg",
  "commercial-cleanout": "/services/commercial.jpg",
};

export function Services() {
  return (
    <section id="services" className="bg-navy-deep py-16 text-cream sm:py-24">
      <Container>
        <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-gold-glow">What we recover</p>
            <h2 className="display mt-3 text-4xl text-cream sm:text-5xl">
              Our Services
              <span className="mt-3 block h-0.5 w-16 bg-gold" aria-hidden />
            </h2>
          </div>
          <TransitionLink
            href="/services"
            className="text-sm font-semibold text-gold-glow hover:text-gold"
          >
            View All Services →
          </TransitionLink>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-5">
          {featuredServices.map((service) => {
            const src = serviceImages[service.slug] ?? "/services/furniture.jpg";
            return (
              <TransitionLink
                key={service.slug}
                href={`/services/${service.slug}` as Route}
                className={cx(
                  "group flex w-[78%] shrink-0 snap-center flex-col overflow-hidden rounded-2xl bg-paper text-navy shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:w-auto",
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-navy-soft">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 18vw, (min-width: 640px) 40vw, 78vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-lg font-semibold leading-snug text-navy">
                    {service.shortName}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone">
                    {service.summary}
                  </p>
                </div>
              </TransitionLink>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
