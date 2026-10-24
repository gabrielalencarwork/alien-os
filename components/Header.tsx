"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BotIcon, XIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import { PRIMARY_NAV, SECONDARY_NAV, SETTINGS_NAV, Sidebar, isActivePath } from "./Sidebar";

const EXTRA_TITLES: { prefix: string; title: string }[] = [
  { prefix: "/integracoes/meta-ads", title: "Meta Ads" },
  { prefix: "/integracoes/google-ads", title: "Google Ads" },
  { prefix: "/integracoes/google-analytics", title: "Google Analytics" },
  { prefix: "/clientes/novo", title: "Novo cliente" },
];

function titleFor(pathname: string) {
  const extra = EXTRA_TITLES.find((e) => pathname.startsWith(e.prefix));
  if (extra) return extra.title;
  const item = [...PRIMARY_NAV, ...SECONDARY_NAV, SETTINGS_NAV].find((i) => isActivePath(pathname, i.href));
  return item?.label ?? "Alien OS";
}

/** Abre o chat rápido da Alien Max (widget flutuante), opcionalmente já com uma pergunta. */
export function openAlienMax(prompt?: string) {
  window.dispatchEvent(new CustomEvent("alien-max:open", { detail: { prompt } }));
}

export function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="h-16 bg-canvas/85 backdrop-blur-md border-b border-line px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            className="lg:hidden w-8 h-8 rounded-lg border border-line bg-surface flex items-center justify-center text-muted hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="font-display text-lg font-bold text-ink truncate leading-none">{titleFor(pathname)}</div>
        </div>

        <div className="flex items-center gap-2">
          {pathname !== "/alien-max" && (
            <button
              type="button"
              onClick={() => openAlienMax()}
              className="h-8 pl-2.5 pr-3 rounded-lg border border-line bg-surface hover:border-accent/60 flex items-center gap-2 text-[13px] text-muted hover:text-ink transition-colors"
            >
              <BotIcon className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">Perguntar à Alien Max</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Menu">
          <Sidebar variant="drawer" onNavigate={() => setDrawerOpen(false)} />
          <button
            type="button"
            className="flex-1 bg-black/50"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
          >
            <XIcon className="w-5 h-5 text-white ml-3 mt-5" />
          </button>
        </div>
      )}
    </>
  );
}
