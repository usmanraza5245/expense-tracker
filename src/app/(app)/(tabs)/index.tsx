import { BudgetBar } from "@/components/budget-bar";
import { ExpenseRow } from "@/components/expense-row";
import { getEffectiveBudget } from "@/lib/budget";
import { formatMoney, monthKey } from "@/lib/format";
import { confirmDeleteExpense } from "@/lib/expense-actions";
import { useBudgetStore } from "@/store/budget.store";
import { useExpenseStore } from "@/store/expense.store";
import type { Expense } from "@/types/expense";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const router = useRouter();
  const expenses = useExpenseStore((s) => s.expenses);
  const loading = useExpenseStore((s) => s.loading);
  const error = useExpenseStore((s) => s.error);
  const defaultBudget = useBudgetStore((s) => s.defaultBudget);
  const budgetMonths = useBudgetStore((s) => s.months);

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const currentKey = monthKey(Date.now());
  const monthSpent = useMemo(
    () =>
      expenses
        .filter((e) => monthKey(e.date) === currentKey)
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses, currentKey]
  );
  const monthBudget = getEffectiveBudget(currentKey, defaultBudget, budgetMonths);
  const overBudget = monthBudget != null && monthSpent > monthBudget;

  const renderItem = ({ item }: { item: Expense }) => (
    <ExpenseRow
      item={item}
      onPress={() => router.push({ pathname: "/add", params: { id: item.id } })}
      onLongPress={() => confirmDeleteExpense(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.fixedHeader}>
        <Text style={styles.heading}>Expenses</Text>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total spent</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
          <Text style={styles.totalCount}>
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
          </Text>
        </View>

        {monthBudget != null ? (
          <Pressable
            style={styles.budgetCard}
            onPress={() =>
              router.push({ pathname: "/budget", params: { month: currentKey } })
            }
          >
            <View style={styles.budgetTop}>
              <Text style={styles.budgetLabel}>This month</Text>
              <Text style={styles.budgetEdit}>Edit</Text>
            </View>
            <Text style={styles.budgetAmount}>
              {formatMoney(monthSpent)}{" "}
              <Text style={styles.budgetOf}>of {formatMoney(monthBudget)}</Text>
            </Text>
            <BudgetBar spent={monthSpent} budget={monthBudget} />
            {overBudget ? (
              <Text style={styles.over}>
                ⚠ Over budget by {formatMoney(monthSpent - monthBudget)}
              </Text>
            ) : (
              <Text style={styles.remaining}>
                {formatMoney(monthBudget - monthSpent)} left
              </Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={styles.setBudget}
            onPress={() => router.push("/budget")}
          >
            <Text style={styles.setBudgetText}>＋ Set a monthly budget</Text>
          </Pressable>
        )}

        {expenses.length > 0 && <Text style={styles.sectionTitle}>Recent</Text>}
      </View>

      <FlatList
        style={styles.list}
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : error ? (
            <Text style={styles.empty}>Couldn&apos;t load expenses:{"\n"}{error}</Text>
          ) : (
            <Text style={styles.empty}>
              No expenses yet. Tap the + button to add your first one.
            </Text>
          )
        }
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push("/add")}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  fixedHeader: { paddingHorizontal: 20, paddingTop: 20 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  heading: { fontSize: 32, fontWeight: "800", color: "#1A1A2E", marginBottom: 16 },
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
    marginBottom: 6,
  },
  budgetLabel: { fontSize: 14, fontWeight: "700", color: "#5A5A6E" },
  budgetEdit: { fontSize: 13, fontWeight: "600", color: "#208AEF" },
  budgetAmount: { fontSize: 20, fontWeight: "800", color: "#1A1A2E", marginBottom: 10 },
  budgetOf: { fontSize: 15, fontWeight: "600", color: "#8A8A9E" },
  over: { color: "#E74C3C", fontSize: 13, fontWeight: "700", marginTop: 8 },
  remaining: { color: "#2ECC71", fontSize: 13, fontWeight: "700", marginTop: 8 },
  setBudget: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: "#DCE3F0",
    borderStyle: "dashed",
  },
  setBudgetText: { fontSize: 15, fontWeight: "700", color: "#208AEF" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 10,
  },
  empty: {
    textAlign: "center",
    color: "#8A8A9E",
    fontSize: 15,
    marginTop: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#208AEF",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabPressed: { opacity: 0.85 },
  fabIcon: { color: "#FFFFFF", fontSize: 32, fontWeight: "600", marginTop: -2 },
});
