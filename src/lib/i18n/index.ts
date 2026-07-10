import { useApp } from "../../store/useApp";
import { translate, type TFn } from "./core";

export * from "./core";

/**
 * The translator bound to the current locale. Reading `prefs.locale` through the
 * store makes every component that calls `useT()` re-render when the language
 * changes, so switching locales in Settings updates the whole app live.
 *
 * Store actions and other non-React code should call `translate(get().prefs.
 * locale, key)` directly instead, to avoid depending on React.
 */
export function useT(): TFn {
  const locale = useApp((s) => s.prefs.locale);
  return (key, params) => translate(locale, key, params);
}
