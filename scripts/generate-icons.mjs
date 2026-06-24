import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

await mkdir(iconsDir, { recursive: true });

// AKCC icon: deep blue background (#173A5E), white cross + circle
function makeSvg(size) {
  const cx = size / 2;
  const r = size * 0.38;
  const barW = size * 0.1;
  const barL = size * 0.55;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#2479C2"/>
  <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="white" stroke-width="${size * 0.04}" opacity="0.35"/>
  <rect x="${cx - barW / 2}" y="${cx - barL / 2}" width="${barW}" height="${barL}" rx="${barW / 2}" fill="white"/>
  <rect x="${cx - barL / 2}" y="${cx - barW / 2}" width="${barL}" height="${barW}" rx="${barW / 2}" fill="white"/>
</svg>`;
}

for (const size of [192, 512]) {
  await sharp(Buffer.from(makeSvg(size)))
    .png()
    .toFile(join(iconsDir, `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}
console.log("Icons written to public/icons/");
