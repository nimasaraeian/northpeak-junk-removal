/**
 * Rasterises Journal hero illustrations into OpenGraph share images.
 *
 * The heroes themselves are SVG: a few KB, vector-crisp at any size, and the
 * fastest thing we can put in front of an LCP. Social platforms, though, do
 * not render SVG in share cards — Facebook, LinkedIn and X all need a raster.
 * So each hero keeps its SVG for the page and gains a 1200x630 PNG twin for
 * `openGraph.images`.
 *
 * Run after editing a hero SVG:  node scripts/generate-journal-og.mjs
 */
import sharp from "sharp";
import path from "path";
import { readdirSync } from "fs";

const root = path.resolve(import.meta.dirname, "..");
const journalDir = path.join(root, "public/journal");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_SUFFIX = "-og.png";

const heroes = readdirSync(journalDir).filter((file) => file.endsWith("-hero.svg"));

if (heroes.length === 0) {
  console.warn("No *-hero.svg files found in public/journal.");
}

for (const hero of heroes) {
  const source = path.join(journalDir, hero);
  const output = path.join(journalDir, hero.replace(/\.svg$/, OG_SUFFIX));

  // `density` drives how sharp rasterises the vector; 2x the target keeps
  // edges clean without producing a needlessly large file.
  await sharp(source, { density: 192 })
    .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(output);

  console.log(`${hero} -> ${path.basename(output)}`);
}
