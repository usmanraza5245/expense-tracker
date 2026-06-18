import { getCategory } from "@/constants/categories";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Expense } from "@/types/expense";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: Expense;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function ExpenseRow({ item, onPress, onLongPress }: Props) {
  const cat = getCategory(item.category);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.iconBubble, { backgroundColor: cat.color + "22" }]}>
        <Text style={styles.icon}>{cat.icon}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{cat.label}</Text>
        {!!item.note && (
          <Text style={styles.rowNote} numberOfLines={1}>
            {item.note}
          </Text>
        )}
        <Text style={styles.rowDate}>{formatDateTime(item.date)}</Text>
      </View>
      <Text style={styles.rowAmount}>{formatMoney(item.amount)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  rowPressed: { opacity: 0.7 },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 20 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A2E" },
  rowNote: { fontSize: 13, color: "#8A8A9E", marginTop: 2 },
  rowDate: { fontSize: 12, color: "#B0B0BE", marginTop: 3 },
  rowAmount: { fontSize: 16, fontWeight: "800", color: "#1A1A2E" },
});
