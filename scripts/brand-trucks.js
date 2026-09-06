const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const root = process.cwd();
const decalPath = path.join(root, "public/truck/logo-decal.png");

const jobs = [
  ["truck-00.png", 0.46, 0.3, 0.24],
  ["truck-01.png", 0.34, 0.27, 0.3],
  ["truck-02.png", 0.52, 0.3, 0.18],
  ["truck-04.png", 0.28, 0.3, 0.18],
  ["truck-05.png", 0.36, 0.27, 0.3],
  ["truck-06.png", 0.28, 0.3, 0.24],
];

async function main() {
  const decalMeta = await sharp(decalPath).metadata();
  for (const [file, leftPct, topPct, widthPct] of jobs) {
    const truckPath = path.join(root, "public/truck", file);
    const meta = await sharp(truckPath).metadata();
    const w = meta.width;
    const h = meta.height;
    const targetW = Math.round(w * widthPct);
    const targetH = Math.round(targetW * (decalMeta.height / decalMeta.width));
    const left = Math.round(w * leftPct);
    const top = Math.round(h * topPct);
    const logo = await sharp(decalPath)
      .resize(targetW, targetH, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const outPath = path.join(root, "public/truck", file.replace(".png", "-branded.png"));
    await sharp(truckPath)
      .composite([{ input: logo, left, top, blend: "over" }])
      .png()
      .toFile(outPath);
    fs.renameSync(outPath, truckPath);
    console.log("branded", file, { left, top, targetW, targetH });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
