import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#208AEF",
        tabBarInactiveTintColor: "#9A9AAE",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarStyle: {
          height: 66 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#000000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="monthly"
        options={{
          title: "Monthly",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📄" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 52,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: "#208AEF1A" },
  icon: { fontSize: 17, opacity: 0.55 },
  iconActive: { opacity: 1 },
});
