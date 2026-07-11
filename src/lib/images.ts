/**
 * Canvas helpers that turn picked images into small JPEG data URLs. The canvas
 * re-encode is also the privacy boundary: it strips EXIF (GPS, device,
 * timestamps) before anything is stored or uploaded, so every user-picked
 * image must pass through here (see the storage-privacy skill).
 */

/** Region of the source image in natural pixels, as react-easy-crop reports. */
export type CropRect = { x: number; y: number; width: number; height: number };

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = url;
  });
}

function drawToDataUrl(
  img: HTMLImageElement,
  src: CropRect,
  maxDim: number,
): string {
  const scale = Math.min(1, maxDim / Math.max(src.width, src.height));
  const w = Math.max(1, Math.round(src.width * scale));
  const h = Math.max(1, Math.round(src.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, src.x, src.y, src.width, src.height, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.82);
}

/** Downscale a whole image file. */
export async function fileToDataUrl(file: File, maxDim = 900): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return drawToDataUrl(img, { x: 0, y: 0, width: img.width, height: img.height }, maxDim);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Cut a region out of an already-loaded image URL (object URL or data URL) and
 * downscale it. The caller keeps ownership of the URL and revokes it.
 */
export async function cropToDataUrl(url: string, rect: CropRect, maxDim = 900): Promise<string> {
  const img = await loadImage(url);
  return drawToDataUrl(img, rect, maxDim);
}
