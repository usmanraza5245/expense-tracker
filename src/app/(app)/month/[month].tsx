import { BudgetBar } from "@/components/budget-bar";
import { ExpenseRow } from "@/components/expense-row";
import { getEffectiveBudget } from "@/lib/budget";
import { confirmDeleteExpense } from "@/lib/expense-actions";
import { formatMoney, formatMonthLabel, monthKey } from "@/lib/format";
import { useBudgetStore } from "@/store/budget.store";
import { useExpenseStore } from "@/store/expense.store";
import type { Expense } from "@/types/expense";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function MonthDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { month } = useLocalSearchParams<{ month: string }>();
  const allExpenses = useExpenseStore((s) => s.expenses);
  const defaultBudget = useBudgetStore((s) => s.defaultBudget);
  const budgetMonths = useBudgetStore((s) => s.months);

  const expenses = useMemo(
    () => allExpenses.filter((e) => monthKey(e.date) === month),
    [allExpenses, month]
  );

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const budget = getEffectiveBudget(month, defaultBudget, budgetMonths);
  const overBudget = budget != null && total > budget;

  const renderItem = ({ item }: { item: Expense }) => (
    <ExpenseRow
      item={item}
      onPress={() => router.push({ pathname: "/add", params: { id: item.id } })}
      onLongPress={() => confirmDeleteExpense(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>{formatMonthLabel(month)}</Text>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total spent</Text>
              <Text style={styles.totalValue}>{formatMoney(total)}</Text>
              <Text style={styles.totalCount}>
                {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
              </Text>
            </View>

            <Pressable
              style={styles.budgetCard}
              onPress={() =>
                router.push({ pathname: "/budget", params: { month } })
              }
            >
              <View style={styles.budgetTop}>
                <Text style={styles.budgetLabel}>
                  {budget != null ? "Budget" : "No budget set"}
                </Text>
                <Text style={styles.budgetEdit}>
                  {budget != null ? "Edit" : "Set budget"}
                </Text>
              </View>
              {budget != null && (
                <>
                  <Text style={styles.budgetAmount}>
                    {formatMoney(total)}{" "}
                    <Text style={styles.budgetOf}>of {formatMoney(budget)}</Text>
                  </Text>
                  <BudgetBar spent={total} budget={budget} />
                  {overBudget ? (
                    <Text style={styles.over}>
                      ⚠ Over budget by {formatMoney(total - budget)}
                    </Text>
                  ) : (
                    <Text style={styles.remaining}>
                      {formatMoney(budget - total)} left
                    </Text>
                  )}
                </>
              )}
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses for this month.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  back: { color: "#208AEF", fontSize: 16, fontWeight: "600" },
  listContent: { padding: 20, paddingTop: 12 },
  heading: { fontSize: 28, fontWeight: "800", color: "#1A1A2E", marginBottom: 16 },
  totalCard: {
    backgroundColor: "#208AEF",
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
  },
  totalLabel: { color: "#DCEBFF", fontSize: 14, fontWeight: "600" },
  totalValue: { color: "#FFFFFF", fontSize: 40, fontWeight: "800", marginTop: 4 },
  totalCount: { color: "#DCEBFF", fontSize: 13, marginTop: 4 },
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  budgetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetLabel: { fontSize: 14, fontWeight: "700", color: "#5A5A6E" },
  budgetEdit: { fontSize: 13, fontWeight: "600", color: "#208AEF" },
  budgetAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A2E",
    marginTop: 8,
    marginBottom: 10,
  },
  budgetOf: { fontSize: 15, fontWeight: "600", color: "#8A8A9E" },
  over: { color: "#E74C3C", fontSize: 13, fontWeight: "700", marginTop: 8 },
  remaining: { color: "#2ECC71", fontSize: 13, fontWeight: "700", marginTop: 8 },
  empty: {
    textAlign: "center",
    color: "#8A8A9E",
    fontSize: 15,
    marginTop: 40,
  },
});
