/**
 * Resolves the effective budget for a month: its explicit override if set,
 * otherwise the recurring default. Returns null when neither is configured.
 */
export function getEffectiveBudget(
  monthKey: string,
  defaultBudget: number | null,
  months: Record<string, number>
): number | null {
  const override = months[monthKey];
  if (typeof override === "number") return override;
  return defaultBudget;
}
