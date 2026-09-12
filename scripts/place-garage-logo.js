const sharp = require("sharp");
const path = require("path");

const root = process.cwd();
const truckDir = path.join(root, "public/truck");

// Near-side dump-bed panel in the shared 1152×864 garage camera.
// 0=TL (rear-top), 1=TR (cab-top), 2=BR (cab-bottom), 3=BL (rear-bottom)
// Near-side exterior cream panel (not inner cab-end wall)
const PANEL = [
  [468, 472],
  [818, 408],
  [828, 595],
  [428, 648],
];

async function drawQuad() {
  const [tl, tr, br, bl] = PANEL;
  const svg = Buffer.from(
    `<svg width="1152" height="864" xmlns="http://www.w3.org/2000/svg">
      <polygon points="${tl[0]},${tl[1]} ${tr[0]},${tr[1]} ${br[0]},${br[1]} ${bl[0]},${bl[1]}"
        fill="rgba(255,0,0,0.28)" stroke="red" stroke-width="3"/>
      ${PANEL.map(
        ([x, y], i) =>
          `<circle cx="${x}" cy="${y}" r="8" fill="red"/><text x="${x + 12}" y="${y - 10}" fill="red" font-size="22" font-weight="700">${i}</text>`,
      ).join("")}
    </svg>`,
  );
  await sharp(path.join(truckDir, "garage-half.png"))
    .composite([{ input: svg, blend: "over" }])
    .png()
    .toFile(path.join(truckDir, "_panel-quad.png"));
}

function insetQuad(quad, pad) {
  const cx = quad.reduce((s, p) => s + p[0], 0) / 4;
  const cy = quad.reduce((s, p) => s + p[1], 0) / 4;
  return quad.map(([x, y]) => [
    x + (cx - x) * pad,
    y + (cy - y) * pad,
  ]);
}

async function warpLogoOnto(srcName, destName) {
  const dest = insetQuad(PANEL, 0.22);
  const [tl, tr, , bl] = dest;

  const meta = await sharp(path.join(truckDir, "logo-side-decal.png")).metadata();
  const lw = meta.width;
  const lh = meta.height;
  const logo = await sharp(path.join(truckDir, "logo-side-decal.png"))
    .ensureAlpha()
    .png()
    .toBuffer();

  const x1 = lw;
  const y2 = lh;
  const u0 = tl[0];
  const v0 = tl[1];
  const u1 = tr[0];
  const v1 = tr[1];
  const u2 = bl[0];
  const v2 = bl[1];

  const a = (u1 - u0) / x1;
  const b = (u2 - u0) / y2;
  const c = (v1 - v0) / x1;
  const d = (v2 - v0) / y2;
  const tx = u0;
  const ty = v0;

  const href = `data:image/png;base64,${logo.toString("base64")}`;
  const svg = Buffer.from(
    `<svg width="1152" height="864" xmlns="http://www.w3.org/2000/svg">
      <image href="${href}" width="${lw}" height="${lh}"
        transform="matrix(${a} ${c} ${b} ${d} ${tx} ${ty})" />
    </svg>`,
  );

  console.log(srcName, { a, b, c, d, tx, ty, dest });

  await sharp(path.join(truckDir, srcName))
    .composite([{ input: svg, blend: "over" }])
    .png()
    .toFile(path.join(truckDir, destName));
}

async function main() {
  const mode = process.argv[2] || "quad";
  if (mode === "quad") {
    await drawQuad();
    console.log("wrote _panel-quad.png");
    return;
  }
  if (mode === "preview") {
    await warpLogoOnto("garage-half.png", "_logo-preview-half.png");
    return;
  }
  const files = [
    "garage-quarter.png",
    "garage-half.png",
    "garage-three-quarter.png",
    "garage-full.png",
  ];
  for (const file of files) {
    const out = file.replace(".png", "-branded.png");
    await warpLogoOnto(file, out);
    console.log("branded", out);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
