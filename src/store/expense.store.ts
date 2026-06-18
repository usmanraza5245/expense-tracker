import type { Expense } from "@/types/expense";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

function sortExpenses(list: Expense[]): Expense[] {
  return [...list].sort((a, b) => b.date - a.date || b.createdAt - a.createdAt);
}

type ExpenseState = {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  setExpenses: (expenses: Expense[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  /** Optimistic insert/replace so changes show immediately without waiting on the listener. */
  upsertExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
};

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenses: [],
      loading: true,
      error: null,
      setExpenses: (expenses) => set({ expenses: sortExpenses(expenses) }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      upsertExpense: (expense) =>
        set((s) => ({
          expenses: sortExpenses([
            expense,
            ...s.expenses.filter((e) => e.id !== expense.id),
          ]),
        })),
      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
    }),
    {
      name: "expenses_cache_v1",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data; `loading` is transient runtime state.
      partialize: (state) => ({ expenses: state.expenses }),
      // Hydrate manually (in useExpensesSync) BEFORE subscribing to Firestore,
      // so a slow async read can't overwrite a live snapshot that arrived
      // first — which made newly-added expenses vanish until an app restart.
      skipHydration: true,
    }
  )
);
