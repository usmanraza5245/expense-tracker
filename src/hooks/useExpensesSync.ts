import { getDeviceId } from "@/lib/device-id";
import { subscribeExpenses } from "@/services/expense.service";
import { useExpenseStore } from "@/store/expense.store";
import { useEffect } from "react";

/**
 * Subscribes the expense store to live Firestore updates for the current
 * device. Cached expenses are restored automatically by the store's persist
 * middleware, so data shows instantly on launch; the first snapshot then
 * supersedes it. Mount once near the root of the authenticated app.
 */
export function useExpensesSync() {
  const setExpenses = useExpenseStore((s) => s.setExpenses);
  const setLoading = useExpenseStore((s) => s.setLoading);
  const setError = useExpenseStore((s) => s.setError);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    (async () => {
      // Restore cached expenses first. Doing this before subscribing prevents a
      // slow hydration from later clobbering a live snapshot.
      await useExpenseStore.persist.rehydrate();
      if (!active) return;
      if (useExpenseStore.getState().expenses.length > 0) setLoading(false);

      const deviceId = await getDeviceId();
      if (!active) return;

      unsubscribe = subscribeExpenses(
        deviceId,
        (list) => {
          setExpenses(list);
          setError(null);
          setLoading(false);
        },
        (error) => {
          console.warn("[expenses] listen error:", error.message);
          setError(error.message);
          setLoading(false);
        }
      );
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [setExpenses, setLoading, setError]);
}
