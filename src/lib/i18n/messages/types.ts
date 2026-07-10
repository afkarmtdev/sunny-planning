/**
 * One message in the three supported locales. Keeping the translations
 * co-located (rather than three parallel dictionaries) makes it impossible for
 * a key to exist in one locale but not another, and `satisfies Record<string,
 * Msg>` on each area file forces every entry to fill all three fields.
 *
 * - `en`     English.
 * - `zh`     Simplified Chinese.
 * - `pinyin` The Hanyu Pinyin of `zh`, with tone numbers (ni3 hao3). This is the
 *            zh-pinyin locale: a learning aid that romanises the same copy.
 *
 * Placeholders are written `{name}` and filled by `translate`.
 */
export type Msg = { en: string; zh: string; pinyin: string };
