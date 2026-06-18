import { BudgetBar } from "@/components/budget-bar";
import { getCategory } from "@/constants/categories";
import { getEffectiveBudget } from "@/lib/budget";
import { formatMoney, formatMonthLabel, monthKey } from "@/lib/format";
import { useBudgetStore } from "@/store/budget.store";
import { useExpenseStore } from "@/store/expense.store";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MonthSummary = {
  key: string;
  total: number;
  count: number;
  topCategory: string;
  budget: number | null;
};

export default function Monthly() {
  const router = useRouter();
  const expenses = useExpenseStore((s) => s.expenses);
  const loading = useExpenseStore((s) => s.loading);
  const defaultBudget = useBudgetStore((s) => s.defaultBudget);
  const budgetMonths = useBudgetStore((s) => s.months);

  const months = useMemo<MonthSummary[]>(() => {
    const map = new Map<
      string,
      { total: number; count: number; byCat: Map<string, number> }
    >();

    for (const e of expenses) {
      const key = monthKey(e.date);
      let bucket = map.get(key);
      if (!bucket) {
        bucket = { total: 0, count: 0, byCat: new Map() };
        map.set(key, bucket);
      }
      bucket.total += e.amount;
      bucket.count += 1;
      bucket.byCat.set(e.category, (bucket.byCat.get(e.category) ?? 0) + e.amount);
    }

    return [...map.entries()]
      .map(([key, b]) => {
        let topCategory = "other";
        let max = -1;
        for (const [cat, amount] of b.byCat) {
          if (amount > max) {
            max = amount;
            topCategory = cat;
          }
        }
        return {
          key,
          total: b.total,
          count: b.count,
          topCategory,
          budget: getEffectiveBudget(key, defaultBudget, budgetMonths),
        };
      })
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [expenses, defaultBudget, budgetMonths]);

  const renderItem = ({ item }: { item: MonthSummary }) => {
    const cat = getCategory(item.topCategory);
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() =>
          router.push({ pathname: "/month/[month]", params: { month: item.key } })
        }
      >
        <View style={styles.cardTop}>
          <Text style={styles.month}>{formatMonthLabel(item.key)}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
        <Text style={styles.total}>{formatMoney(item.total)}</Text>
        {item.budget != null && (
          <View style={styles.budgetWrap}>
            <BudgetBar spent={item.total} budget={item.budget} />
            <Text
              style={[
                styles.budgetText,
                item.total > item.budget && styles.budgetOver,
              ]}
            >
              {item.total > item.budget
                ? `Over by ${formatMoney(item.total - item.budget)}`
                : `${formatMoney(item.budget - item.total)} left of ${formatMoney(item.budget)}`}
            </Text>
          </View>
        )}
        <View style={styles.cardBottom}>
          <Text style={styles.count}>
            {item.count} {item.count === 1 ? "entry" : "entries"}
          </Text>
          <View style={[styles.topChip, { backgroundColor: cat.color + "22" }]}>
            <Text style={styles.topIcon}>{cat.icon}</Text>
            <Text style={[styles.topLabel, { color: cat.color }]}>{cat.label}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={months}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.heading}>Monthly</Text>}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : (
            <Text style={styles.empty}>
              No expenses yet. Add some to see your monthly breakdown.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  listContent: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 32, fontWeight: "800", color: "#1A1A2E", marginBottom: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.7 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  month: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  chevron: { fontSize: 24, color: "#C4C4D0", fontWeight: "600" },
  total: { fontSize: 30, fontWeight: "800", color: "#208AEF", marginTop: 6 },
  budgetWrap: { marginTop: 12, gap: 6 },
  budgetText: { fontSize: 12, color: "#8A8A9E", fontWeight: "600" },
  budgetOver: { color: "#E74C3C" },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  count: { fontSize: 13, color: "#8A8A9E", fontWeight: "600" },
  topChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  topIcon: { fontSize: 13 },
  topLabel: { fontSize: 12, fontWeight: "700" },
  empty: {
    textAlign: "center",
    color: "#8A8A9E",
    fontSize: 15,
    marginTop: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
});
