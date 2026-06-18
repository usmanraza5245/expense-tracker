import { db } from "@/lib/firebase";
import type { Expense } from "@/types/expense";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const expensesCol = collection(db, "expenses");

export type ExpenseInput = {
  amount: number;
  category: string;
  note?: string;
  /** User-chosen date/time of the expense (ms epoch). */
  date: number;
};

export async function addExpense(
  deviceId: string,
  input: ExpenseInput
): Promise<Expense> {
  const createdAt = Date.now();
  const ref = await addDoc(expensesCol, { ...input, deviceId, createdAt });
  return { id: ref.id, deviceId, createdAt, ...input };
}

export function updateExpense(id: string, input: ExpenseInput) {
  return updateDoc(doc(db, "expenses", id), { ...input });
}

export function deleteExpense(id: string) {
  return deleteDoc(doc(db, "expenses", id));
}

/**
 * Subscribes to all expenses belonging to the given device. Results are sorted
 * client-side (newest first) to avoid needing a composite Firestore index.
 */
export function subscribeExpenses(
  deviceId: string,
  cb: (expenses: Expense[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(expensesCol, where("deviceId", "==", deviceId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        // Legacy docs predate the editable `date` field; fall back to createdAt.
        return { id: d.id, ...data, date: data.date ?? data.createdAt } as Expense;
      });
      // Newest first; createdAt breaks ties when entries share the same date.
      list.sort((a, b) => b.date - a.date || b.createdAt - a.createdAt);
      cb(list);
    },
    (error) => onError?.(error)
  );
}
