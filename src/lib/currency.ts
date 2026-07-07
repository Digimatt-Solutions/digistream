export const CURRENCY = "Ksh";

export function ksh(value: number | string | null | undefined, opts?: { decimals?: number }): string {
  const n = Number(value ?? 0);
  const d = opts?.decimals ?? 0;
  return `${CURRENCY} ${n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}
