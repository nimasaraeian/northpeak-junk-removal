import assert from "node:assert/strict";
import test from "node:test";
import { escapeTelegramHtml } from "@/lib/telegram/escape-html";

test("escapeTelegramHtml escapes HTML-sensitive characters", () => {
  assert.equal(
    escapeTelegramHtml('Tom & Jerry <script>"quote"'),
    "Tom &amp; Jerry &lt;script&gt;&quot;quote&quot;",
  );
});
