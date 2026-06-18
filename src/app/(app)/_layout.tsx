import { useBudgetSync } from "@/hooks/useBudgetSync";
import { useExpensesSync } from "@/hooks/useExpensesSync";
import { Stack } from "expo-router";

export default function AppLayout() {
  useExpensesSync();
  useBudgetSync();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add" options={{ presentation: "modal" }} />
      <Stack.Screen name="budget" options={{ presentation: "modal" }} />
      <Stack.Screen name="month/[month]" />
    </Stack>
  );
}
