import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type BudgetState = {
  defaultBudget: number | null;
  months: Record<string, number>;
  setBudget: (defaultBudget: number | null, months: Record<string, number>) => void;
};

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      defaultBudget: null,
      months: {},
      setBudget: (defaultBudget, months) => set({ defaultBudget, months }),
    }),
    {
      name: "budget_cache_v1",
      storage: createJSONStorage(() => AsyncStorage),
      // Hydrate manually (in useBudgetSync) before subscribing, so a slow async
      // read can't overwrite a live snapshot. See the expense store for details.
      skipHydration: true,
    }
  )
);
