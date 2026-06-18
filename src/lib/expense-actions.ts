import { getCategory } from "@/constants/categories";
import { formatMoney } from "@/lib/format";
import { deleteExpense } from "@/services/expense.service";
import { useExpenseStore } from "@/store/expense.store";
import type { Expense } from "@/types/expense";
import { Alert } from "react-native";

export function confirmDeleteExpense(item: Expense) {
  Alert.alert(
    "Delete expense",
    `Remove ${getCategory(item.category).label} of ${formatMoney(item.amount)}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // Optimistically remove so the UI updates without waiting on the listener.
          useExpenseStore.getState().removeExpense(item.id);
          deleteExpense(item.id).catch(() => {
            // Restore on failure.
            useExpenseStore.getState().upsertExpense(item);
            Alert.alert("Error", "Could not delete. Check your connection.");
          });
        },
      },
    ]
  );
}
