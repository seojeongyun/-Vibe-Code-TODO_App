import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');
const logoPath = resolve(publicDir, 'logo.svg');
const faviconPath = resolve(publicDir, 'favicon.svg');

const logoSvg = await readFile(logoPath);

await writeFile(faviconPath, logoSvg);

await sharp(logoSvg)
  .resize(192, 192)
  .png()
  .toFile(resolve(publicDir, 'pwa-192.png'));

await sharp(logoSvg)
  .resize(512, 512)
  .png()
  .toFile(resolve(publicDir, 'pwa-512.png'));

console.log('Icons generated:', 'pwa-192.png', 'pwa-512.png', 'favicon.svg');
