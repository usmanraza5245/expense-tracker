import { StyleSheet, View, type DimensionValue } from "react-native";

export function BudgetBar({ spent, budget }: { spent: number; budget: number }) {
  const ratio = budget > 0 ? spent / budget : 0;
  const over = ratio > 1;
  const pct = Math.max(0, Math.min(ratio, 1)) * 100;

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${pct}%` as DimensionValue,
            backgroundColor: over ? "#E74C3C" : "#208AEF",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E6E8EF",
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 4 },
});
