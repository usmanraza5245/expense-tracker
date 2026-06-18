import { getEffectiveBudget } from "@/lib/budget";
import { formatDate, formatMoney, formatMonthLabel, monthKey } from "@/lib/format";
import { exportReportPdf, type ReportData } from "@/lib/report";
import { useBudgetStore } from "@/store/budget.store";
import { useExpenseStore } from "@/store/expense.store";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Mode = "month" | "custom" | "all";

const MODES: { key: Mode; label: string }[] = [
  { key: "month", label: "By month" },
  { key: "custom", label: "Custom" },
  { key: "all", label: "All time" },
];

export default function Reports() {
  const expenses = useExpenseStore((s) => s.expenses);
  const defaultBudget = useBudgetStore((s) => s.defaultBudget);
  const budgetMonths = useBudgetStore((s) => s.months);

  const availableMonths = useMemo(() => {
    const keys = new Set<string>();
    for (const e of expenses) keys.add(monthKey(e.date));
    return [...keys].sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const [mode, setMode] = useState<Mode>("month");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => availableMonths[0] ?? monthKey(Date.now())
  );
  const [from, setFrom] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [to, setTo] = useState<Date>(() => new Date());
  const [generating, setGenerating] = useState(false);

  const reportData = useMemo<ReportData>(() => {
    if (mode === "all") {
      return {
        title: "All expenses",
        subtitle: "All time",
        expenses,
        budget: null,
      };
    }
    if (mode === "month") {
      const list = expenses.filter((e) => monthKey(e.date) === selectedMonth);
      return {
        title: formatMonthLabel(selectedMonth),
        subtitle: "Monthly report",
        expenses: list,
        budget: getEffectiveBudget(selectedMonth, defaultBudget, budgetMonths),
      };
    }
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    const lo = Math.min(start.getTime(), end.getTime());
    const hi = Math.max(start.getTime(), end.getTime());
    const list = expenses.filter((e) => e.date >= lo && e.date <= hi);
    return {
      title: "Expense report",
      subtitle: `${formatDate(lo)} – ${formatDate(hi)}`,
      expenses: list,
      budget: null,
    };
  }, [mode, selectedMonth, from, to, expenses, defaultBudget, budgetMonths]);

  const previewTotal = reportData.expenses.reduce((s, e) => s + e.amount, 0);

  const pickDate = (current: Date, onPick: (d: Date) => void) => {
    DateTimePickerAndroid.open({
      value: current,
      mode: "date",
      onChange: (event: { type: string }, selected?: Date) => {
        if (event.type === "set" && selected) onPick(selected);
      },
    });
  };

  const onExport = async () => {
    if (!reportData.expenses.length) {
      Alert.alert("Nothing to export", "There are no expenses in this range.");
      return;
    }
    setGenerating(true);
    try {
      await exportReportPdf(reportData);
    } catch {
      Alert.alert("Export failed", "Could not generate the report. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Reports</Text>

        <View style={styles.segment}>
          {MODES.map((m) => {
            const active = mode === m.key;
            return (
              <Pressable
                key={m.key}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                onPress={() => setMode(m.key)}
              >
                <Text
                  style={[styles.segmentText, active && styles.segmentTextActive]}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === "month" && (
          <View style={styles.section}>
            <Text style={styles.label}>Select month</Text>
            {availableMonths.length === 0 ? (
              <Text style={styles.muted}>No expenses recorded yet.</Text>
            ) : (
              <View style={styles.monthList}>
                {availableMonths.map((key) => {
                  const active = selectedMonth === key;
                  return (
                    <Pressable
                      key={key}
                      style={[styles.monthChip, active && styles.monthChipActive]}
                      onPress={() => setSelectedMonth(key)}
                    >
                      <Text
                        style={[
                          styles.monthChipText,
                          active && styles.monthChipTextActive,
                        ]}
                      >
                        {formatMonthLabel(key)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {mode === "custom" && (
          <View style={styles.section}>
            <Text style={styles.label}>Date range</Text>
            <View style={styles.dateRow}>
              <Pressable
                style={styles.dateField}
                onPress={() => pickDate(from, setFrom)}
              >
                <Text style={styles.dateFieldLabel}>From</Text>
                <Text style={styles.dateFieldValue}>
                  {formatDate(from.getTime())}
                </Text>
              </Pressable>
              <Pressable
                style={styles.dateField}
                onPress={() => pickDate(to, setTo)}
              >
                <Text style={styles.dateFieldLabel}>To</Text>
                <Text style={styles.dateFieldValue}>
                  {formatDate(to.getTime())}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>{reportData.subtitle}</Text>
          <Text style={styles.previewTotal}>{formatMoney(previewTotal)}</Text>
          <Text style={styles.previewCount}>
            {reportData.expenses.length}{" "}
            {reportData.expenses.length === 1 ? "expense" : "expenses"}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.exportBtn,
            (pressed || generating) && styles.exportBtnPressed,
          ]}
          onPress={onExport}
          disabled={generating}
        >
          <Text style={styles.exportText}>
            {generating ? "Generating…" : "Export PDF"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 32, fontWeight: "800", color: "#1A1A2E", marginBottom: 16 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#E8EAF1",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentItemActive: { backgroundColor: "#FFFFFF" },
  segmentText: { fontSize: 14, fontWeight: "600", color: "#8A8A9E" },
  segmentTextActive: { color: "#208AEF", fontWeight: "700" },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "700", color: "#5A5A6E", marginBottom: 10 },
  muted: { fontSize: 14, color: "#8A8A9E" },
  monthList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  monthChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  monthChipActive: { borderColor: "#208AEF", backgroundColor: "#208AEF1A" },
  monthChipText: { fontSize: 14, color: "#5A5A6E", fontWeight: "600" },
  monthChipTextActive: { color: "#208AEF", fontWeight: "700" },
  dateRow: { flexDirection: "row", gap: 10 },
  dateField: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateFieldLabel: { fontSize: 12, color: "#8A8A9E", fontWeight: "600" },
  dateFieldValue: {
    fontSize: 16,
    color: "#1A1A2E",
    fontWeight: "700",
    marginTop: 2,
  },
  previewCard: {
    backgroundColor: "#208AEF",
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
  },
  previewLabel: { color: "#DCEBFF", fontSize: 14, fontWeight: "600" },
  previewTotal: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 4,
  },
  previewCount: { color: "#DCEBFF", fontSize: 13, marginTop: 4 },
  exportBtn: {
    backgroundColor: "#208AEF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  exportBtnPressed: { opacity: 0.85 },
  exportText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
