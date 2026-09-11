import sharp from "sharp";
import { copyFileSync, mkdirSync } from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public/brand/logo-nav.png");
const outDir = path.join(root, "public/brand");
const publicDir = path.join(root, "public");
const appPath = path.join(root, "src/app");

const meta = await sharp(source).metadata();
/** Icon mark only — exclude the NorthPeak wordmark for small tab sizes. */
const cropHeight = Math.round(meta.width * 0.48);

const mark = sharp(source).extract({
  left: 0,
  top: 0,
  width: meta.width,
  height: Math.min(cropHeight, meta.height),
});

const sizes = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-48.png", size: 48 },
  { name: "favicon-192.png", size: 192 },
  { name: "favicon-512.png", size: 512 },
];

mkdirSync(outDir, { recursive: true });
mkdirSync(appPath, { recursive: true });

for (const { name, size } of sizes) {
  await mark
    .clone()
    .resize(size, size, {
      fit: "contain",
      background: { r: 251, g: 248, b: 242, alpha: 1 },
    })
    .png()
    .toFile(path.join(outDir, name));
}

await mark
  .clone()
  .resize(180, 180, {
    fit: "contain",
    background: { r: 251, g: 248, b: 242, alpha: 1 },
  })
  .png()
  .toFile(path.join(publicDir, "apple-touch-icon.png"));

await mark
  .clone()
  .resize(32, 32, {
    fit: "contain",
    background: { r: 251, g: 248, b: 242, alpha: 1 },
  })
  .png()
  .toFile(path.join(publicDir, "favicon.ico"));

copyFileSync(path.join(outDir, "favicon-32.png"), path.join(appPath, "icon.png"));
copyFileSync(
  path.join(publicDir, "apple-touch-icon.png"),
  path.join(appPath, "apple-icon.png"),
);

console.log("Favicons generated from logo-nav.png");
