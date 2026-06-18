import { db } from "@/lib/firebase";
import type { Budget } from "@/types/budget";
import { deleteField, doc, onSnapshot, setDoc } from "firebase/firestore";

const budgetDoc = (deviceId: string) => doc(db, "budgets", deviceId);

export function subscribeBudget(deviceId: string, cb: (budget: Budget) => void) {
  return onSnapshot(budgetDoc(deviceId), (snap) => {
    const data = snap.data();
    cb({
      defaultBudget: data?.defaultBudget ?? null,
      months: (data?.months as Record<string, number>) ?? {},
    });
  });
}

export function setDefaultBudget(deviceId: string, amount: number) {
  return setDoc(
    budgetDoc(deviceId),
    { deviceId, defaultBudget: amount },
    { merge: true }
  );
}

export function setMonthBudget(deviceId: string, monthKey: string, amount: number) {
  return setDoc(
    budgetDoc(deviceId),
    { deviceId, months: { [monthKey]: amount } },
    { merge: true }
  );
}

export function clearMonthBudget(deviceId: string, monthKey: string) {
  return setDoc(
    budgetDoc(deviceId),
    { months: { [monthKey]: deleteField() } },
    { merge: true }
  );
}
