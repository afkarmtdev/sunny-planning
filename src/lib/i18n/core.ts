import { messages } from "./messages";

/**
 * The three shipped locales. `zh-pinyin` renders the same Simplified Chinese
 * copy as `zh` but romanised into tone-numbered Hanyu Pinyin, as a reading aid.
 */
export type Locale = "en" | "zh" | "zh-pinyin";

export type MessageKey = keyof typeof messages;
export type TParams = Record<string, string | number>;
export type TFn = (key: MessageKey, params?: TParams) => string;

/** Picker metadata: `label` is the compact chip glyph, `name` the full title. */
export const LOCALES: ReadonlyArray<{ id: Locale; label: string; name: string }> = [
  { id: "en", label: "EN", name: "English" },
  { id: "zh", label: "中", name: "中文" },
  { id: "zh-pinyin", label: "拼", name: "Pinyin" },
];

// Which field of a message each locale reads.
const FIELD: Record<Locale, "en" | "zh" | "pinyin"> = {
  en: "en",
  zh: "zh",
  "zh-pinyin": "pinyin",
};

/**
 * Resolve a message key in a locale, filling `{placeholder}` params. Falls back
 * to English if a field is ever empty, so a half-finished translation degrades
 * to readable copy instead of a blank.
 */
export function translate(locale: Locale, key: MessageKey, params?: TParams): string {
  const entry = messages[key] as { en: string; zh: string; pinyin: string };
  let text = entry[FIELD[locale]] || entry.en;
  if (params) {
    for (const name in params) {
      text = text.replaceAll(`{${name}}`, String(params[name]));
    }
  }
  return text;
}
