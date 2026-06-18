export type Budget = {
  /** Recurring budget applied to any month without an explicit override. */
  defaultBudget: number | null;
  /** Per-month overrides, keyed by "YYYY-MM". */
  months: Record<string, number>;
};
