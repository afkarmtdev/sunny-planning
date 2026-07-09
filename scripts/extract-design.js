// Unpacks a Claude Design standalone bundle: template HTML + embedded assets.
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const inPath = process.argv[2];
const outDir = process.argv[3];
const html = readFileSync(inPath, "utf8");

function grab(type) {
  const marker = `<script type="__bundler/${type}">`;
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const from = start + marker.length;
  const end = html.indexOf("</script>", from);
  return html.slice(from, end).trim();
}

const manifest = JSON.parse(grab("manifest"));
const extResources = JSON.parse(grab("ext_resources") || "[]");
const template = JSON.parse(grab("template"));

mkdirSync(join(outDir, "assets"), { recursive: true });

const mimeToExt = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "image/gif": "gif",
  "font/woff2": "woff2",
  "font/woff": "woff",
  "font/ttf": "ttf",
  "application/javascript": "js",
  "text/javascript": "js",
  "text/css": "css",
};

const extByUuid = new Map(extResources.map((e) => [e.uuid, e.id]));
const index = [];
for (const [uuid, entry] of Object.entries(manifest)) {
  const ext = mimeToExt[entry.mime] || "bin";
  let bytes = Buffer.from(entry.data, "base64");
  if (entry.compressed) bytes = Buffer.from(Bun.gunzipSync(bytes));
  const fname = `${uuid}.${ext}`;
  writeFileSync(join(outDir, "assets", fname), bytes);
  index.push({
    uuid,
    mime: entry.mime,
    bytes: bytes.length,
    file: `assets/${fname}`,
    externalUrl: extByUuid.get(uuid) || null,
    refsInTemplate: template.split(uuid).length - 1,
  });
}

writeFileSync(join(outDir, "sunny-planning.html"), template);
writeFileSync(join(outDir, "asset-index.json"), JSON.stringify(index, null, 2));

console.log("template chars:", template.length);
console.log("assets:", index.length);
for (const a of [...index].sort((x, y) => y.bytes - x.bytes)) {
  console.log(
    `${a.file}  ${a.mime}  ${(a.bytes / 1024).toFixed(1)}KB  refs:${a.refsInTemplate}  ${a.externalUrl || ""}`
  );
}
