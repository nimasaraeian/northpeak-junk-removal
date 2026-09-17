import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { blogPosts, getPost } from "@/content/blog";
import { site } from "@/content/site";
import {
  heroShareImage,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
} from "@/lib/blog/share-image";
import { pageMetadata } from "@/lib/seo";
import type { BlogImage } from "@/types";

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
  const images = everyBlogImage();
  assert.ok(images.length > 0, "expected the Journal to carry illustrations");

  for (const { label, image } of images) {
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
  const heroes = blogPosts.filter((post) => post.heroImage);
  assert.ok(heroes.length > 0);

  for (const post of heroes) {
    const share = heroShareImage(post.heroImage!);
    const file = assetPath(share.url);

    // Fails when a hero is added or renamed without re-running
    // scripts/generate-journal-og.mjs.
    assert.ok(existsSync(file), `missing OG image for ${post.slug}: run scripts/generate-journal-og.mjs`);
    assert.ok(share.url.endsWith(".png"), "share cards need a raster, not an SVG");
    assert.equal(share.width, OG_IMAGE_WIDTH);
    assert.equal(share.height, OG_IMAGE_HEIGHT);
    assert.equal(share.alt, post.heroImage!.alt);
  }
});

test("the mattress post carries its hero and three figures", () => {
  const post = getPost(SLUG)!;
  assert.equal(post.heroImage?.src, "/journal/mattress-hero.svg");

  const figures = post.body.filter((block) => block.type === "figure");
  assert.equal(figures.length, 3);
  for (const figure of figures) {
    assert.ok(figure.type === "figure" && figure.caption, "each figure needs a caption");
  }
});

test("the post's share metadata points at the absolute OG raster", () => {
  const post = getPost(SLUG)!;
  const metadata = pageMetadata({
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
    image: heroShareImage(post.heroImage!),
  });

  const expected = `${site.url}/journal/mattress-hero-og.png`;
  const og = metadata.openGraph?.images;
  const twitter = metadata.twitter?.images;

  assert.ok(Array.isArray(og) && og.length === 1);
  assert.equal((og[0] as { url: string }).url, expected);
  assert.ok(Array.isArray(twitter) && twitter.length === 1);
  assert.equal((twitter[0] as { url: string }).url, expected);
});

test("posts without a hero emit no share image", () => {
  const plain = blogPosts.find((post) => !post.heroImage);
  assert.ok(plain, "expected at least one post without a hero");

  const metadata = pageMetadata({
    title: plain.seoTitle,
    description: plain.seoDescription,
    path: `/blog/${plain.slug}`,
  });

  assert.equal(metadata.openGraph?.images, undefined);
  assert.equal(metadata.twitter?.images, undefined);
});
