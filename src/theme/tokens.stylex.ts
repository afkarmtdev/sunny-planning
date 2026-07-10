import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  shellPink: "#FFD3E8",
  bubblegum: "#FF8FC2",
  heartPop: "#FF4D9D",
  cream: "#FFF9F0",
  lcdMint: "#D9F2E4",
  marmalade: "#FFA24C",
  lavender: "#CDB4F6",
  ink: "#332B33",
  white: "#FFFFFF",
  kraft: "#E8DCC8",
});

// Baloo 2, Nunito, Silkscreen, and Gaegu are all Latin-only, so each family
// chain appends a CJK-capable fallback: Latin glyphs render in the primary
// pixel-cute face, and Chinese characters fall through to the CJK face. ZCOOL
// KuaiLe is a rounded, playful display face matching Baloo 2; Noto Sans SC is
// the workhorse body; Ma Shan Zheng is a brush script standing in for Gaegu's
// handwriting. Silkscreen only ever shows Latin numerals, but Noto Sans SC
// backs it too so a stray CJK glyph never boxes.
export const fonts = stylex.defineVars({
  display: "'Baloo 2', 'ZCOOL KuaiLe', sans-serif",
  body: "'Nunito', 'Noto Sans SC', sans-serif",
  lcd: "'Silkscreen', 'Noto Sans SC', monospace",
  hand: "'Gaegu', 'Ma Shan Zheng', cursive",
});
