import type { ShareImage } from "@/lib/seo";
import type { BlogImage } from "@/types";

/**
 * Share cards are always 1200x630 — the ratio Facebook, LinkedIn and X crop to.
 * `scripts/generate-journal-og.mjs` writes the PNGs at exactly this size.
 */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * The raster twin of a hero SVG, by the naming convention the generator script
 * uses: `foo-hero.svg` -> `foo-hero-og.png`.
 *
 * Heroes are SVG because that is the cheapest thing to put in front of an LCP,
 * but no major social platform renders SVG in a share card, so the crawler is
 * pointed at the PNG instead. `blog-visuals.test.ts` asserts the PNG actually
 * exists for every hero, so a hero added without re-running the script fails
 * the suite rather than shipping a blank share card.
 */
export function heroShareImage(hero: BlogImage): ShareImage {
  return {
    url: hero.src.endsWith(".svg") ? hero.src.replace(/\.svg$/, "-og.png") : hero.src,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: hero.alt,
  };
}
