import { getReceiptBlob, putReceipt } from "../lib/receipts";

/**
 * The demo "Street food" expense on the night market date references this
 * fixed receipt id; seeding draws the image once so receipt thumbnails and
 * the lightbox work in demo mode without any upload.
 */
export const DEMO_RECEIPT_ID = "rc-demo-street-food";

function drawDemoReceipt(): Blob | Promise<Blob | null> | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#FFFDF8";
  ctx.fillRect(0, 0, 480, 640);
  ctx.fillStyle = "#332B33";
  ctx.textAlign = "center";

  ctx.font = "bold 30px monospace";
  ctx.fillText("PASAR MALAM", 240, 70);
  ctx.fillText("STALL 12", 240, 108);
  ctx.font = "20px monospace";
  ctx.fillText("2026-07-07  20:15", 240, 156);

  ctx.textAlign = "left";
  const line = (y: number) => {
    ctx.fillText("-".repeat(28), 40, y);
  };
  line(200);
  ctx.fillText("Grilled squid    RM 14.00", 40, 250);
  ctx.fillText("Apam balik       RM  8.00", 40, 296);
  ctx.fillText("Lok lok x4       RM 12.00", 40, 342);
  line(390);
  ctx.font = "bold 24px monospace";
  ctx.fillText("TOTAL            RM 34.00", 40, 444);
  ctx.font = "20px monospace";
  ctx.fillText("TUNAI            RM 50.00", 40, 494);
  ctx.fillText("BAKI             RM 16.00", 40, 540);
  ctx.textAlign = "center";
  ctx.fillText("TERIMA KASIH!", 240, 600);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
  });
}

/** Idempotent: draws and stores the demo receipt only when it is not already there. */
export async function seedDemoReceipt(): Promise<void> {
  try {
    const existing = await getReceiptBlob(DEMO_RECEIPT_ID);
    if (existing) return;
    const blob = await drawDemoReceipt();
    if (blob) await putReceipt(DEMO_RECEIPT_ID, blob);
  } catch {
    // Demo nicety only; the expense simply shows without a thumbnail.
  }
}
