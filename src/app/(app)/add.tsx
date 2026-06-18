import { CATEGORIES } from "@/constants/categories";
import { getDeviceId } from "@/lib/device-id";
import { formatDate, formatTime } from "@/lib/format";
import {
  addExpense,
  updateExpense,
  type ExpenseInput,
} from "@/services/expense.service";
import { useExpenseStore } from "@/store/expense.store";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { z } from "zod";

const schema = z.object({
  amount: z
    .string()
    .min(1, "Enter an amount")
    .refine((v) => Number(v) > 0, "Enter a valid amount greater than 0"),
  category: z.string().min(1, "Pick a category"),
  note: z.string().max(120, "Note is too long").optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AddExpense() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useExpenseStore((s) =>
    id ? s.expenses.find((e) => e.id === id) : undefined
  );
  const isEditing = !!id;

  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date>(
    existing?.date ? new Date(existing.date) : new Date()
  );

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      onChange: (event: { type: string }, selected?: Date) => {
        if (event.type === "set" && selected) setDate(selected);
      },
    });
  };

  const openTimePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: "time",
      is24Hour: false,
      onChange: (event: { type: string }, selected?: Date) => {
        if (event.type === "set" && selected) setDate(selected);
      },
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: existing ? String(existing.amount) : "",
      category: existing?.category ?? CATEGORIES[0].key,
      note: existing?.note ?? "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const input: ExpenseInput = {
      amount: Number(values.amount),
      category: values.category,
      note: values.note?.trim() || "",
      date: date.getTime(),
    };

    setSubmitting(true);
    try {
      if (id) {
        await updateExpense(id, input);
        if (existing) {
          useExpenseStore.getState().upsertExpense({ ...existing, ...input });
        }
      } else {
        const deviceId = await getDeviceId();
        const created = await addExpense(deviceId, input);
        useExpenseStore.getState().upsertExpense(created);
      }
      router.back();
    } catch {
      Alert.alert("Error", "Could not save expense. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>{isEditing ? "Edit expense" : "Add expense"}</Text>
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
          <Text style={styles.label}>Amount</Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={styles.amountWrapper}>
                <Text style={styles.currency}>Rs</Text>
                <TextInput
                  style={styles.amountInput}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="0.00"
                  placeholderTextColor="#B6B6C4"
                  keyboardType="decimal-pad"
                  autoFocus={!isEditing}
                />
              </View>
            )}
          />
          {errors.amount && (
            <Text style={styles.error}>{errors.amount.message}</Text>
          )}

          <Text style={[styles.label, { marginTop: 24 }]}>Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const selected = value === cat.key;
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => onChange(cat.key)}
                      style={[
                        styles.categoryChip,
                        selected && {
                          borderColor: cat.color,
                          backgroundColor: cat.color + "1A",
                        },
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryLabel,
                          selected && { color: cat.color, fontWeight: "700" },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
          {errors.category && (
            <Text style={styles.error}>{errors.category.message}</Text>
          )}

          <Text style={[styles.label, { marginTop: 24 }]}>Date & time</Text>
          <View style={styles.dateRow}>
            <Pressable style={styles.dateField} onPress={openDatePicker}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateValue}>{formatDate(date.getTime())}</Text>
            </Pressable>
            <Pressable style={styles.dateField} onPress={openTimePicker}>
              <Text style={styles.dateIcon}>🕒</Text>
              <Text style={styles.dateValue}>{formatTime(date.getTime())}</Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { marginTop: 24 }]}>Note (optional)</Text>
          <Controller
            control={control}
            name="note"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.noteInput}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="What was it for?"
                placeholderTextColor="#B6B6C4"
                maxLength={120}
              />
            )}
          />
          {errors.note && <Text style={styles.error}>{errors.note.message}</Text>}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.submit,
            { marginBottom: insets.bottom + 16 },
            (pressed || submitting) && styles.submitPressed,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? "Saving…" : isEditing ? "Save changes" : "Add expense"}
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
  title: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  content: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5A5A6E",
    marginBottom: 10,
  },
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
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
  },
  categoryIcon: { fontSize: 16 },
  categoryLabel: { fontSize: 14, color: "#5A5A6E", fontWeight: "600" },
  dateRow: { flexDirection: "row", gap: 10 },
  dateField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateIcon: { fontSize: 16 },
  dateValue: { fontSize: 15, color: "#1A1A2E", fontWeight: "600" },
  noteInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A2E",
  },
  error: { color: "#E74C3C", fontSize: 13, marginTop: 8, fontWeight: "600" },
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
