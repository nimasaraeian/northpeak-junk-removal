import { cookies } from "next/headers";
import { DEFAULT_LANG, isLang, translate, LANG_COOKIE, type Lang } from "@/lib/i18n/dict";

/** Reads the panel language from the cookie. Server components only. */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

/** A translate function bound to the current request's language. */
export async function getT(): Promise<(s: string) => string> {
  const lang = await getLang();
  return (s: string) => translate(s, lang);
}
