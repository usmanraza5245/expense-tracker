import { getDeviceId } from "@/lib/device-id";
import { subscribeBudget } from "@/services/budget.service";
import { useBudgetStore } from "@/store/budget.store";
import { useEffect } from "react";

/**
 * Keeps the budget store in sync with Firestore for the current device.
 * Mount once near the root of the authenticated app.
 */
export function useBudgetSync() {
  const setBudget = useBudgetStore((s) => s.setBudget);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    (async () => {
      // Restore cache before subscribing so slow hydration can't clobber a live
      // snapshot (mirrors useExpensesSync).
      await useBudgetStore.persist.rehydrate();
      if (!active) return;

      const deviceId = await getDeviceId();
      if (!active) return;
      unsubscribe = subscribeBudget(deviceId, (b) =>
        setBudget(b.defaultBudget, b.months)
      );
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setBudget]);
}
