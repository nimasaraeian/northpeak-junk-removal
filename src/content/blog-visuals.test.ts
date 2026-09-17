import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { blogPosts, getPost } from "@/content/blog";
import {
  heroShareImage,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "@/lib/blog/share-image";
import { pageMetadata } from "@/lib/seo";
import type { BlogImage } from "@/types";

/**
 * The Journal ships no illustrations today, so most of these assert over an
 * empty set and pass vacuously. They are kept deliberately: the moment a post
 * gains a hero or a figure, every rule below starts applying to it — the file
 * has to exist, its declared box has to match its intrinsic size, its alt text
 * has to say something, it has to stay small, and a hero has to have its OG
 * raster generated. That is cheaper to keep than to remember.
 */

const SLUG = "how-to-get-rid-of-mattress-vancouver";
const PUBLIC_DIR = path.join(process.cwd(), "public");

function assetPath(src: string) {
  return path.join(PUBLIC_DIR, src.replace(/^\//, ""));
}

/** Intrinsic size an SVG reports, so declared dimensions can be checked. */
function svgViewBox(file: string) {
  const markup = readFileSync(file, "utf8");
  const match = markup.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  assert.ok(match, `${path.basename(file)} needs a viewBox starting at 0 0`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function everyBlogImage(): Array<{ label: string; image: BlogImage }> {
  const images: Array<{ label: string; image: BlogImage }> = [];

  for (const post of blogPosts) {
    if (post.heroImage) {
      images.push({ label: `${post.slug} hero`, image: post.heroImage });
    }
    for (const block of post.body) {
      if (block.type === "figure") {
        images.push({ label: `${post.slug} figure ${block.image.src}`, image: block.image });
      }
    }
  }

  return images;
}

test("every Journal illustration exists in public/", () => {
  for (const { label, image } of everyBlogImage()) {
    assert.ok(existsSync(assetPath(image.src)), `missing asset for ${label}: ${image.src}`);
  }
});

test("declared dimensions match each SVG's intrinsic size", () => {
  // A mismatch here is layout shift: the browser reserves the declared box and
  // then the vector paints at a different ratio.
  for (const { label, image } of everyBlogImage()) {
    if (!image.src.endsWith(".svg")) continue;
    const box = svgViewBox(assetPath(image.src));
    assert.equal(image.width, box.width, `${label} width does not match its viewBox`);
    assert.equal(image.height, box.height, `${label} height does not match its viewBox`);
  }
});

test("every illustration carries descriptive alt text", () => {
  for (const { label, image } of everyBlogImage()) {
    assert.ok(image.alt.trim().length > 20, `${label} needs real alt text`);
    assert.ok(!/^image of|^picture of/i.test(image.alt), `${label} alt text is filler`);
  }
});

test("illustrations stay small enough not to hurt LCP", () => {
  for (const { label, image } of everyBlogImage()) {
    const bytes = statSync(assetPath(image.src)).size;
    assert.ok(bytes < 60_000, `${label} is ${bytes} bytes — too heavy for flat vector art`);
  }
});

test("every hero has a generated OG raster twin of the right size", () => {
  for (const post of blogPosts.filter((item) => item.heroImage)) {
    const share = heroShareImage(post.heroImage!);

    // Fails when a hero is added or renamed without re-running
    // scripts/generate-journal-og.mjs.
    assert.ok(
      existsSync(assetPath(share.url)),
      `missing OG image for ${post.slug}: run scripts/generate-journal-og.mjs`,
    );
    assert.ok(share.url.endsWith(".png"), "share cards need a raster, not an SVG");
    assert.equal(share.width, OG_IMAGE_WIDTH);
    assert.equal(share.height, OG_IMAGE_HEIGHT);
    assert.equal(share.alt, post.heroImage!.alt);
  }
});

test("heroShareImage points a hero SVG at its raster twin", () => {
  // Pure derivation, so it holds whether or not any hero currently exists.
  const share = heroShareImage({
    src: "/journal/example-hero.svg",
    alt: "An illustration with alt text long enough to be useful.",
    width: 1200,
    height: 630,
  });

  assert.equal(share.url, "/journal/example-hero-og.png");
  assert.equal(share.width, OG_IMAGE_WIDTH);
  assert.equal(share.height, OG_IMAGE_HEIGHT);
});

test("the mattress post renders clean, with no hero and no figures", () => {
  const post = getPost(SLUG)!;
  assert.equal(post.heroImage, undefined);
  assert.equal(post.body.some((block) => block.type === "figure"), false);
});

test("posts without a hero emit no share image", () => {
  for (const post of blogPosts.filter((item) => !item.heroImage)) {
    const metadata = pageMetadata({
      title: post.seoTitle,
      description: post.seoDescription,
      path: `/blog/${post.slug}`,
    });

    assert.equal(metadata.openGraph?.images, undefined);
    assert.equal(metadata.twitter?.images, undefined);
  }
});
