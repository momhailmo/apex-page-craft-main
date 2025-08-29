import { cn } from "@/lib/utils";
import { Globe, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteConfig } from "@/state/site-config";

export default function SiteHeader() {
  const { state } = useSiteConfig();
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = () => {
      try {
        setCount(
          JSON.parse(localStorage.getItem("contactMessages") || "[]").filter(
            (m: any) => !m.read,
          ).length,
        );
      } catch {
        setCount(0);
      }
    };
    load();
    const onAny = () => load();
    window.addEventListener("storage", onAny);
    window.addEventListener("contact-messages-change", onAny as any);
    return () => {
      window.removeEventListener("storage", onAny);
      window.removeEventListener("contact-messages-change", onAny as any);
    };
  }, []);
  useEffect(() => {
    const el = document.getElementById("app-root-bg");
    if (el)
      (el as HTMLElement).style.background = state.theme.pageBg || "#ffffff";
  }, [state.theme.pageBg]);
  return (
    <header className={cn("w-full border-b border-neutral-200", "bg-white")}>
      <div className="mx-auto max-w-[1200px] px-6 py-4 flex items-center justify-between h-[70px]">
        <a
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl text-neutral-900"
        >
          {state.header.logoUrl ? (
            <img
              src={state.header.logoUrl}
              alt="logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <span className="inline-block h-8 w-8 rounded-md bg-gradient-to-br from-sky-500 to-cyan-400" />
          )}
          <span>{state.header.logoText}</span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-neutral-700">
          <a
            href="#"
            className="inline-flex items-center gap-2 hover:text-neutral-900 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>
              {state.header.languages?.find(
                (l) => l.code === state.header.selectedLang,
              )?.label || state.header.languageText}
            </span>
          </a>
          <a
            href="#contact"
            className="relative inline-flex items-center gap-2 hover:text-neutral-900 transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>{state.header.contactText}</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-3 h-5 min-w-5 px-1 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center">
                {count}
              </span>
            )}
          </a>
          <a
            href="/admin"
            className="text-xs px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200"
          >
            Admin
          </a>
        </nav>
      </div>
    </header>
  );
}
