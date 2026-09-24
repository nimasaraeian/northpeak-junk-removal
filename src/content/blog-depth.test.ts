import assert from "node:assert/strict";
import test from "node:test";
import { blogPosts, getPost } from "@/content/blog";
import { toPlainText } from "@/lib/blog/rich-text";
import nextConfig from "../../next.config";

function words(post: (typeof blogPosts)[number]) {
  return post.body
    .flatMap((block) => {
      if (block.type === "paragraph" || block.type === "heading") return [block.text];
      if (block.type === "callout") return [block.text];
      if (block.type === "list") return block.items;
      if (block.type === "table") return block.rows.flat();
      return [];
    })
    .reduce((total, text) => total + toPlainText(text).split(/\s+/).filter(Boolean).length, 0);
}

test("no post is thin enough to drag the rest of the site down", () => {
  // Five posts shipped at 97–117 words. A published URL either earns its place
  // in the index or it should not be one.
  for (const post of blogPosts) {
    const count = words(post);
    assert.ok(count >= 600, `${post.slug} is only ${count} words`);
  }
});

test("every post carries FAQ pairs for the answer engines", () => {
  for (const post of blogPosts) {
    assert.ok(post.faqs && post.faqs.length >= 5, `${post.slug} carries no FAQ block`);
    for (const faq of post.faqs!) {
      assert.ok(faq.question.endsWith("?"), `${post.slug}: not a question — ${faq.question}`);
      assert.ok(faq.answer.split(/\s+/).length >= 35, `${post.slug}: answer too short`);
    }
  }
});

test("stated reading time is not inflated past the word count", () => {
  // The retired posts claimed 5–6 minutes for about 100 words. Understating is
  // harmless; a badge that promises four times the article is a quality signal
  // in the wrong direction, so only the ceiling is asserted.
  for (const post of blogPosts) {
    const stated = Number(post.readingTime.replace(/\D+/g, ""));
    const actual = words(post) / 200;
    assert.ok(stated >= 1, `${post.slug} states no reading time`);
    assert.ok(
      stated <= actual + 3,
      `${post.slug} claims ${stated} min for ${words(post)} words`,
    );
  }
});

test("the consolidated posts are gone and redirect permanently", async () => {
  const retired = [
    ["/blog/junk-removal-north-vancouver-what-to-expect", "/locations/north-vancouver"],
    ["/blog/garage-cleanout-north-shore-homes", "/blog/garage-cleanout-north-vancouver-cost"],
  ];

  const redirects = await nextConfig.redirects!();

  for (const [source, destination] of retired) {
    assert.equal(getPost(source.replace("/blog/", "")), undefined, `${source} still exists`);

    const rule = redirects.find((item) => item.source === source);
    assert.ok(rule, `${source} was removed without a redirect`);
    assert.equal(rule.destination, destination);
    assert.equal(rule.permanent, true, `${source} must redirect 301, not 302`);
  }
});

test("a retired post's destination is itself a real page", () => {
  assert.ok(getPost("garage-cleanout-north-vancouver-cost"));
});
