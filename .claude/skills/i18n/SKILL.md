---
name: i18n
description: How multi-language (en / zh / zh-pinyin) works in Sunny Planning and how to add or change translatable copy. Use whenever adding a user-facing string, a new screen, or touching the message catalogue, locale pref, or CJK fonts.
---

# Multi-language (i18n) house standard

Sunny Planning ships three locales: `en`, `zh` (Simplified Chinese), and
`zh-pinyin` (the same Chinese romanised into tone-numbered Hanyu Pinyin, e.g.
`ni3 hao3`, as a reading aid). It is a tiny homegrown layer, no library.

## Architecture

- `src/lib/i18n/messages/` is the catalogue. One co-located entry per key holds
  **all three locales at once**: `{ en, zh, pinyin }` (`Msg` type in
  `messages/types.ts`). Co-locating them makes it impossible for a key to exist
  in one locale but not another. Each area file ends with
  `satisfies Record<string, Msg>`, which forces every entry to fill all three
  fields while keeping the literal key types for `keyof`.
- `messages/index.ts` merges every area file into `messages` with spreads, so
  `keyof typeof messages` is the union of all keys.
- `src/lib/i18n/core.ts` owns `Locale`, `MessageKey`, `LOCALES` (picker
  metadata), and `translate(locale, key, params?)`. It imports only the
  catalogue, never the store, so it is safe to import anywhere.
- `src/lib/i18n/index.ts` re-exports core and adds the `useT()` hook. The hook
  reads `prefs.locale` from the store, so every component that calls `useT()`
  re-renders live when the language changes.

Import rule of thumb:
- React components: `import { useT } from "../lib/i18n";` then `const t = useT();`
  and `t("area.key")` or `t("area.key", { name })`.
- Non-React code (store actions, class components): import from
  `../lib/i18n/core` and call `translate(get().prefs.locale, "area.key")`
  directly. Never import the store into `core.ts` (it would cycle; `index.ts`
  already imports the store for the hook).

The chosen locale lives in the `prefs` slice of `src/store/useApp.ts` alongside
`soundOn` / `hapticsOn` / `notifyToday`, defaults to `en`, and is bumped in the
persist `migrate` (see the `Prefs` default there). See [[store-supabase-sync]] if
it ever needs to sync.

## Adding a translatable string

1. Pick the area file (`home`, `costs`, `builder`, `ui`, ...) or create a new one.
2. Add a key `"<area>.<lowerCamelSubkey>"` with `{ en, zh, pinyin }`, filling all
   three. Reuse the shared `common.*` keys (save, cancel, discard, delete,
   remove, keep, back, home, done, close, edit, add, retry, notSet) when the
   English matches, instead of redefining them.
3. Use `{placeholder}` for interpolated values and pass them as the second arg.
   Keep the SAME placeholders in all three locales.
4. In the component, call `t("<area>.<key>")`.
5. To add a whole new area file: `export const <area> = { ... } satisfies
   Record<string, Msg>;`, then spread it into `messages/index.ts`.

Do NOT translate: currency (`rm`/`rmCompact` in `format.ts`), date/time output
(`shortDate`, `longDate`, `stampDate`, `clockLabel`, `monthLabel`, ...), or
proper nouns kept verbatim in every locale: `Sunny`, `Sunny Planning`, `RM`,
`PDF`, `Waze`, `Google Maps`, and the skin display names (Strawberry Milk, Retro
LCD, Scrapbook, Love Letter). Values written into stored records (e.g. a blank
stop's fallback name) are data, not live UI; think twice before routing them
through `t()` since they freeze at the locale active when saved.

## Translation rules (zh + pinyin)

- `zh` is natural, concise Simplified Chinese UI copy (not literal).
- `pinyin` is the Hanyu Pinyin of the SAME `zh`, tone NUMBERS 1-4, neutral tone =
  5 (`de5`, `zi5`, `le5`, `ne5`, `zhe5`, `men5`). Syllables space-separated.
  Apply tone sandhi for 一 and 不 (e.g. 一个 -> `yi2 ge4`, 一笔 -> `yi4 bi3`);
  write other 3rd-tone syllables in citation form.
- In BOTH zh and pinyin keep Latin words / digits / `{placeholders}` / full-width
  Chinese punctuation （，。！？：、) verbatim; romanise characters only.
- No emojis, no em dashes, in any locale (project copy rule).

### Glossary (keep terminology consistent)

date (outing) 约会 yue1 hui4 · itinerary 行程 xing2 cheng2 · stop 地点 di4 dian3 ·
venue 场所 chang3 suo3 · spend 花费 hua1 fei4 · cost/fee 费用 fei4 yong4 · budget
预算 yu4 suan4 · estimate 预估 yu4 gu1 · total 合计 he2 ji4 · receipt 收据 shou1
ju4 · photo 照片 zhao4 pian4 · album 相册 xiang4 ce4 · caption 说明 shuo1 ming2 ·
rating 评分 ping2 fen1 · paw 爪印 zhua3 yin4 · favourite 收藏 shou1 cang2 · note
备注 bei4 zhu4 · category 分类 fen1 lei4 · partner 伴侣 ban4 lv3 · invite 邀请
yao1 qing3 · Day-of 当天模式 dang1 tian1 mo2 shi4 · skin 样式 yang4 shi4 · export
导出 dao3 chu1 · print 打印 da3 yin4 · birthday 生日 sheng1 ri4 · log in 登录
deng1 lu4 · magic link 魔法链接 mo2 fa3 lian4 jie1 · planned 已计划 · completed
已完成 · cancelled 已取消. Sunny stays "Sunny" in every locale.

## Fonts (the fragile part)

Baloo 2, Nunito, Silkscreen, and Gaegu are Latin-only. `src/theme/tokens.stylex.ts`
appends a CJK fallback to each family chain (`'Baloo 2', 'ZCOOL KuaiLe',
sans-serif`, etc.) so Latin renders in the pixel-cute face and Chinese falls
through to ZCOOL KuaiLe / Noto Sans SC / Ma Shan Zheng. The `@fontsource/*` CSS is
imported in `src/main.tsx`. Editing token *values* is safe; do NOT touch the
StyleX babel *options* without mirroring `vite.config.ts` and `babel.config.cjs`
(see CLAUDE.md). CJK subsets are large, so `vite.config.ts` excludes them from the
PWA precache (`globIgnores`) and caches them at runtime (`runtimeCaching`) instead
of bloating the SW install. Add any font via the [[add-dep]] 10-day rule.

## Verifying

After changes: `bunx --bun tsc --noEmit` (satisfies + keyof catch missing keys and
bad `t()` calls), then `bunx --bun vite build`. A quick catalogue integrity check
worth re-running: iterate `messages`, assert no empty locale field and that
`{placeholders}` match across en/zh/pinyin for every key.
