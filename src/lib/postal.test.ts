import assert from "node:assert/strict";
import test from "node:test";
import { resolveServiceAreaAlias } from "@/content/service-areas";
import {
  checkServiceArea,
  isValidCanadianPostalCode,
  normalizePostalCode,
} from "@/lib/postal";

test("normalizePostalCode uppercases and formats compact input", () => {
  assert.equal(normalizePostalCode("v7m2h7"), "V7M 2H7");
  assert.equal(normalizePostalCode("V7M 2H7"), "V7M 2H7");
});

test("isValidCanadianPostalCode accepts spaced and compact codes", () => {
  assert.equal(isValidCanadianPostalCode("V7M 2H7"), true);
  assert.equal(isValidCanadianPostalCode("V7M2H7"), true);
  assert.equal(isValidCanadianPostalCode("INVALID"), false);
});

test("checkServiceArea returns core tier for North Vancouver", () => {
  const result = checkServiceArea("V7L 2A1");
  assert.ok(!("error" in result));
  assert.equal(result.tier, "core");
  assert.equal(result.city, "North Vancouver");
  assert.match(result.headline, /Great news/i);
});

test("checkServiceArea returns core tier for Vancouver", () => {
  const result = checkServiceArea("V6K 1A1");
  assert.ok(!("error" in result));
  assert.equal(result.tier, "core");
  assert.equal(result.city, "Vancouver");
});

test("checkServiceArea returns core tier for Richmond", () => {
  const result = checkServiceArea("V6X 1A1");
  assert.ok(!("error" in result));
  assert.equal(result.tier, "core");
  assert.equal(result.city, "Richmond");
});

test("checkServiceArea returns extended tier for Surrey", () => {
  const result = checkServiceArea("V3X 1A1");
  assert.ok(!("error" in result));
  assert.equal(result.tier, "extended");
  assert.equal(result.city, "Surrey");
  assert.match(result.headline, /may service/i);
});

test("checkServiceArea returns extended tier for Coquitlam", () => {
  const result = checkServiceArea("V3B 1A1");
  assert.ok(!("error" in result));
  assert.equal(result.tier, "extended");
  assert.equal(result.city, "Coquitlam");
});

test("checkServiceArea returns confirmation tier for Abbotsford", () => {
  const result = checkServiceArea("V2S 1A1");
  assert.ok(!("error" in result));
  assert.equal(result.tier, "confirmation");
  assert.equal(result.city, "Abbotsford");
  assert.match(result.headline, /outside our standard service area/i);
});

test("checkServiceArea returns confirmation tier for Squamish", () => {
  const result = checkServiceArea("V8B 0A1");
  assert.ok(!("error" in result));
  assert.equal(result.tier, "confirmation");
  assert.equal(result.city, "Squamish");
});

test("checkServiceArea returns outside tier for unmapped BC postal codes", () => {
  const result = checkServiceArea("V1A 1A1");
  assert.ok(!("error" in result));
  assert.equal(result.tier, "outside");
  assert.match(result.message, /Larger jobs or special pickups/i);
});

test("resolveServiceAreaAlias maps locality names to cities", () => {
  assert.equal(resolveServiceAreaAlias("Lynn Valley"), "North Vancouver");
  assert.equal(resolveServiceAreaAlias("District of North Vancouver"), "North Vancouver");
  assert.equal(resolveServiceAreaAlias("Township of Langley"), "Langley");
  assert.equal(resolveServiceAreaAlias("Tsawwassen"), "Delta");
  assert.equal(resolveServiceAreaAlias("UBC"), "Vancouver");
});
