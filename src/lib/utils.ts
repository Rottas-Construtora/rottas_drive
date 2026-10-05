import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata um tamanho em bytes para uma string legível (B, KB, MB, GB). */
export function formatBytes(bytes: number | null | undefined): string {
  const n = bytes ?? 0;
  if (n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const value = n / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : value >= 100 ? 0 : 1)} ${units[i]}`;
}

/** Valores distintos (sem diferenciar maiúsculas) de uma lista de textos, em ordem alfabética. */
export function distinctValues(values: (string | null | undefined)[]): string[] {
  const byKey = new Map<string, string>();
  for (const v of values) {
    const t = v?.trim();
    if (t && !byKey.has(t.toLowerCase())) byKey.set(t.toLowerCase(), t);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
