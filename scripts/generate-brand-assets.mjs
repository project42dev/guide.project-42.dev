import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const checkOnly = process.argv.includes("--check");
const appIconPath = resolve(root, "public/brand/project-42-app-icon.svg");
const maskableIconPath = resolve(
  root,
  "public/brand/project-42-maskable-icon.svg",
);
const socialPath = resolve(root, "public/brand/project-42-social.svg");
const manifestPath = resolve(root, "public/brand/asset-manifest.json");

const appIcon = await readFile(appIconPath);
const maskableIcon = await readFile(maskableIconPath);
const social = await readFile(socialPath);
const rasterAssets = [
  ["favicon-16x16.png", 16, 16, appIcon],
  ["favicon-32x32.png", 32, 32, appIcon],
  ["favicon-48x48.png", 48, 48, appIcon],
  ["apple-touch-icon.png", 180, 180, appIcon],
  ["icon-192x192.png", 192, 192, appIcon],
  ["icon-512x512.png", 512, 512, appIcon],
  ["icon-maskable-512x512.png", 512, 512, maskableIcon],
  ["og.png", 1200, 630, social],
];

if (checkOnly) {
  await validateCommittedAssets();
  console.log("Validated Project 42 brand sources, raster assets, manifest, and ICO.");
} else {
  const generated = new Map();
  for (const [filename, width, height, source] of rasterAssets) {
    const buffer = await sharp(source, { density: 384 })
      .resize(width, height, { fit: "fill" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    generated.set(filename, buffer);
    await writeFile(resolve(root, "public", filename), buffer);
  }

  const icoSizes = [16, 32, 48, 256];
  const icoFrames = [];
  for (const size of icoSizes) {
    icoFrames.push(
      await sharp(appIcon, { density: 384 })
        .resize(size, size, { fit: "fill" })
        .png({ compressionLevel: 9 })
        .toBuffer(),
    );
  }
  const ico = createIco(icoSizes, icoFrames);
  generated.set("favicon.ico", ico);
  await writeFile(resolve(root, "public/favicon.ico"), ico);

  const manifest = {
    schemaVersion: "1.0",
    sources: {
      "project-42-app-icon.svg": sha256(appIcon),
      "project-42-maskable-icon.svg": sha256(maskableIcon),
      "project-42-social.svg": sha256(social),
    },
    generated: Object.fromEntries(
      [...generated].map(([filename, buffer]) => [
        filename,
        { bytes: buffer.length, sha256: sha256(buffer) },
      ]),
    ),
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await validateCommittedAssets();
  console.log(`Generated and validated ${generated.size} Project 42 brand assets.`);
}

async function validateCommittedAssets() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.schemaVersion !== "1.0") {
    throw new Error("Unsupported brand asset manifest");
  }
  if (manifest.sources["project-42-app-icon.svg"] !== sha256(appIcon)) {
    throw new Error("Application icon source changed without regenerating assets");
  }
  if (manifest.sources["project-42-social.svg"] !== sha256(social)) {
    throw new Error("Social source changed without regenerating assets");
  }
  if (manifest.sources["project-42-maskable-icon.svg"] !== sha256(maskableIcon)) {
    throw new Error("Maskable icon source changed without regenerating assets");
  }

  for (const [filename, width, height] of rasterAssets) {
    const filePath = resolve(root, "public", filename);
    const file = await readFile(filePath);
    const metadata = await sharp(file).metadata();
    if (metadata.width !== width || metadata.height !== height) {
      throw new Error(
        `${filename} is ${metadata.width}x${metadata.height}; expected ${width}x${height}`,
      );
    }
    validateManifestEntry(manifest, filename, file);
  }

  const ico = await readFile(resolve(root, "public/favicon.ico"));
  validateIco(ico, [16, 32, 48, 256]);
  validateManifestEntry(manifest, "favicon.ico", ico);
  await stat(resolve(root, "public/brand/project-42-wordmark.svg"));
  await stat(resolve(root, "public/brand/project-42-mark.svg"));
  await stat(resolve(root, "public/brand/project-42-mark-mono.svg"));
  await stat(resolve(root, "public/brand/project-42-mark-reversed.svg"));
}

function validateManifestEntry(manifest, filename, file) {
  const entry = manifest.generated[filename];
  if (!entry || entry.bytes !== file.length || entry.sha256 !== sha256(file)) {
    throw new Error(`${filename} does not match the committed asset manifest`);
  }
}

function createIco(sizes, frames) {
  const directory = Buffer.alloc(6 + sizes.length * 16);
  directory.writeUInt16LE(0, 0);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(sizes.length, 4);
  let offset = directory.length;
  for (const [index, size] of sizes.entries()) {
    const entry = 6 + index * 16;
    directory.writeUInt8(size === 256 ? 0 : size, entry);
    directory.writeUInt8(size === 256 ? 0 : size, entry + 1);
    directory.writeUInt8(0, entry + 2);
    directory.writeUInt8(0, entry + 3);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(frames[index].length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += frames[index].length;
  }
  return Buffer.concat([directory, ...frames]);
}

function validateIco(buffer, expectedSizes) {
  if (
    buffer.readUInt16LE(0) !== 0 ||
    buffer.readUInt16LE(2) !== 1 ||
    buffer.readUInt16LE(4) !== expectedSizes.length
  ) {
    throw new Error("favicon.ico has an invalid directory header");
  }
  for (const [index, expected] of expectedSizes.entries()) {
    const entry = 6 + index * 16;
    const width = buffer.readUInt8(entry) || 256;
    const height = buffer.readUInt8(entry + 1) || 256;
    if (width !== expected || height !== expected) {
      throw new Error(
        `favicon.ico frame ${index} is ${width}x${height}; expected ${expected}x${expected}`,
      );
    }
  }
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
