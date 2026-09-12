import sharp from "sharp";
import path from "path";
import { existsSync } from "fs";

const root = path.resolve(import.meta.dirname, "..");
const asset = path.join(
  root,
  "../.cursor/projects/c-Users-USER-Desktop-northpeak-junk-removal/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_b4dba3dbed966a4179fd5c7d684ae5ba_images_northpeak_robot_mascot_sticker-816a8c18-d780-49ed-8651-4079c968bd59.png",
);

const input = existsSync(asset)
  ? asset
  : path.join(root, "public/brand/peak-sticker.png");
const output = path.join(root, "public/brand/peak-sticker.png");
const temp = path.join(root, "public/brand/peak-sticker.tmp.png");

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const alpha = new Uint8Array(width * height).fill(255);

function pixelIndex(x, y) {
  return (y * width + x) * channels;
}

function isBackground(r, g, b) {
  // Canvas black and dark anti-alias fringe only.
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max <= 40) return true;
  if (max <= 55 && max - min <= 8) return true;
  return false;
}

const queue = [];

for (let x = 0; x < width; x += 1) {
  queue.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y += 1) {
  queue.push([0, y], [width - 1, y]);
}

const visited = new Uint8Array(width * height);
let head = 0;

while (head < queue.length) {
  const [x, y] = queue[head++];
  if (x < 0 || y < 0 || x >= width || y >= height) continue;

  const visitIndex = y * width + x;
  if (visited[visitIndex]) continue;
  visited[visitIndex] = 1;

  const i = pixelIndex(x, y);
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  if (!isBackground(r, g, b)) continue;

  alpha[visitIndex] = 0;

  queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const visitIndex = y * width + x;
    const i = pixelIndex(x, y);
    data[i + 3] = alpha[visitIndex];
  }
}

await sharp(data, { raw: { width, height, channels } })
  .trim({ threshold: 1 })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(temp);

await sharp(temp).toFile(output);

console.log(`Wrote transparent sticker: ${output}`);
