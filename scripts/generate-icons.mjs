/**
 * Generates PWA icons for CISSP Trainer Pro.
 * Run once: node scripts/generate-icons.mjs
 *
 * Produces:
 *   public/icon-192.png   (192x192)
 *   public/icon-512.png   (512x512)
 *   public/apple-icon.png (180x180)
 *   public/favicon.ico    (32x32, ICO format via PNG)
 */

import sharp from "sharp";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

// SVG source — "CT" initials on primary-500 (#0ea5e9) background
function buildSvg(size) {
  const fontSize = Math.round(size * 0.38);
  const radius = Math.round(size * 0.18);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#bg)"/>
  <text
    x="50%"
    y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="white"
    letter-spacing="-2"
  >CT</text>
</svg>`.trim();
}

async function generateIcon(size, filename) {
  const svg = Buffer.from(buildSvg(size));
  await sharp(svg).resize(size, size).png().toFile(resolve(publicDir, filename));
  console.log(`✓ ${filename} (${size}x${size})`);
}

async function generateFavicon() {
  // Generate a 32x32 PNG, then write it as .ico (single-size ICO is valid PNG-inside-ICO)
  const svg = Buffer.from(buildSvg(32));
  const pngBuffer = await sharp(svg).resize(32, 32).png().toBuffer();

  // Build a minimal ICO file wrapping the 32x32 PNG
  const headerSize = 6;
  const dirEntrySize = 16;
  const imageOffset = headerSize + dirEntrySize;
  const fileSize = imageOffset + pngBuffer.length;

  const ico = Buffer.alloc(fileSize);
  // ICONDIR header
  ico.writeUInt16LE(0, 0);       // reserved
  ico.writeUInt16LE(1, 2);       // type: 1 = ICO
  ico.writeUInt16LE(1, 4);       // image count: 1

  // ICONDIRENTRY
  ico.writeUInt8(32, 6);         // width (0 = 256, use 32)
  ico.writeUInt8(32, 7);         // height
  ico.writeUInt8(0, 8);          // color count
  ico.writeUInt8(0, 9);          // reserved
  ico.writeUInt16LE(1, 10);      // color planes
  ico.writeUInt16LE(32, 12);     // bits per pixel
  ico.writeUInt32LE(pngBuffer.length, 14); // image size
  ico.writeUInt32LE(imageOffset, 18);      // image offset

  pngBuffer.copy(ico, imageOffset);
  writeFileSync(resolve(publicDir, "favicon.ico"), ico);
  console.log("✓ favicon.ico (32x32)");
}

await generateIcon(192, "icon-192.png");
await generateIcon(512, "icon-512.png");
await generateIcon(180, "apple-icon.png");
await generateFavicon();

console.log("\nAll icons generated in public/");
