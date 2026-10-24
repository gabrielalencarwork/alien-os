const TZ = "America/Sao_Paulo";

export function brl(n: number, opts: { compact?: boolean } = {}) {
  if (opts.compact && Math.abs(n) >= 10000) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
  }
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function int(n: number) {
  return Math.round(n).toLocaleString("pt-BR");
}

export function pct(n: number | null, digits = 0) {
  if (n === null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("pt-BR", { maximumFractionDigits: digits })}%`;
}

/** Data de hoje no fuso de Brasília, no formato AAAA-MM-DD. */
export function todayLocal() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "seg., 24 out." */
export function shortDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" });
}

/** "há 3 h", "há 2 dias", "agora" */
export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}

export function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

export function greeting() {
  const h = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: TZ }).format(new Date()));
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function longToday() {
  return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}
