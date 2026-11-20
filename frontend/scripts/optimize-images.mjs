// Converts every image in assets-inbox/ to an optimised .webp in public/images/ (same sub-folder).
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const INBOX = 'assets-inbox';
const OUT = 'public/images';
const EXT = new Set(['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.avif', '.tif', '.tiff']);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let done = 0;
for await (const file of walk(INBOX)) {
  if (!EXT.has(path.extname(file).toLowerCase())) continue;
  const out = path.join(OUT, path.relative(INBOX, file)).replace(/\.[^.]+$/, '.webp');
  try {
    if ((await stat(out)).mtimeMs > (await stat(file)).mtimeMs) continue; // already up to date
  } catch { /* output does not exist yet */ }
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(file).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  console.log('✔', out);
  done++;
}
console.log(done ? `Done: ${done} image(s) optimised.` : 'Nothing new to optimise.');
