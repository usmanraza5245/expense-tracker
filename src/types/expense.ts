export type Expense = {
  id: string;
  deviceId: string;
  amount: number;
  category: string;
  note?: string;
  /** User-editable date/time of the expense (ms epoch). */
  date: number;
  /** Record creation time (ms epoch). */
  createdAt: number;
};
