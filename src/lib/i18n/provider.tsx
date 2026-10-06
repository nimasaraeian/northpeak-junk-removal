"use client";

import { createContext, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LANG, translate, LANG_COOKIE, type Lang } from "@/lib/i18n/dict";

interface LangValue {
  lang: Lang;
  t: (s: string) => string;
  setLang: (lang: Lang) => void;
}

const LangCtx = createContext<LangValue>({
  lang: DEFAULT_LANG,
  t: (s) => s,
  setLang: () => {},
});

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const t = useCallback((s: string) => translate(s, lang), [lang]);
  const setLang = useCallback(
    (next: Lang) => {
      document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      router.refresh();
    },
    [router],
  );
  return <LangCtx.Provider value={{ lang, t, setLang }}>{children}</LangCtx.Provider>;
}

export function useT(): LangValue {
  return useContext(LangCtx);
}
