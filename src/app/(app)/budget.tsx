import { getDeviceId } from "@/lib/device-id";
import { formatMoney, formatMonthLabel } from "@/lib/format";
import {
  clearMonthBudget,
  setDefaultBudget,
  setMonthBudget,
} from "@/services/budget.service";
import { useBudgetStore } from "@/store/budget.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function BudgetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { month } = useLocalSearchParams<{ month?: string }>();
  const defaultBudget = useBudgetStore((s) => s.defaultBudget);
  const months = useBudgetStore((s) => s.months);

  const isMonth = !!month;
  const hasOverride = isMonth && typeof months[month!] === "number";
  const initial = isMonth ? months[month!] : defaultBudget;

  const [amount, setAmount] = useState(initial != null ? String(initial) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const save = async () => {
    const value = Number(amount);
    if (!amount || isNaN(value) || value <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      const store = useBudgetStore.getState();
      if (isMonth) {
        await setMonthBudget(deviceId, month!, value);
        store.setBudget(store.defaultBudget, { ...store.months, [month!]: value });
      } else {
        await setDefaultBudget(deviceId, value);
        store.setBudget(value, store.months);
      }
      router.back();
    } catch {
      Alert.alert("Error", "Could not save budget. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeOverride = async () => {
    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      await clearMonthBudget(deviceId, month!);
      const store = useBudgetStore.getState();
      const { [month!]: _removed, ...rest } = store.months;
      store.setBudget(store.defaultBudget, rest);
      router.back();
    } catch {
      Alert.alert("Error", "Could not update budget. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = isMonth ? formatMonthLabel(month!) : "Monthly budget";
  const helper = isMonth
    ? defaultBudget != null
      ? `Leave unset to use the default of ${formatMoney(defaultBudget)}.`
      : "Sets the budget for this month only."
    : "Applies to every month without its own budget.";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Set budget</Text>
        <View style={{ width: 56 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>{title}</Text>
          <View style={styles.amountWrapper}>
            <Text style={styles.currency}>Rs</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#B6B6C4"
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
          <Text style={styles.helper}>{helper}</Text>
          {error && <Text style={styles.error}>{error}</Text>}

          {hasOverride && (
            <Pressable
              style={styles.removeBtn}
              onPress={removeOverride}
              disabled={submitting}
            >
              <Text style={styles.removeText}>
                Remove this month&apos;s budget
                {defaultBudget != null ? ` (use ${formatMoney(defaultBudget)})` : ""}
              </Text>
            </Pressable>
          )}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.submit,
            { marginBottom: insets.bottom + 16 },
            (pressed || submitting) && styles.submitPressed,
          ]}
          onPress={save}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? "Saving…" : "Save budget"}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  cancel: { color: "#208AEF", fontSize: 16, fontWeight: "600", width: 56 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: "700", color: "#5A5A6E", marginBottom: 10 },
  amountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
  },
  currency: { fontSize: 28, fontWeight: "700", color: "#1A1A2E" },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A2E",
    paddingVertical: 16,
    marginLeft: 6,
  },
  helper: { fontSize: 13, color: "#8A8A9E", marginTop: 10, lineHeight: 18 },
  error: { color: "#E74C3C", fontSize: 13, marginTop: 8, fontWeight: "600" },
  removeBtn: { marginTop: 24, alignSelf: "flex-start" },
  removeText: { color: "#E74C3C", fontSize: 15, fontWeight: "600" },
  submit: {
    backgroundColor: "#208AEF",
    margin: 20,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitPressed: { opacity: 0.85 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
