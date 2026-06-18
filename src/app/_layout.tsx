import { Stack } from "expo-router";
import { NavigationBar } from "expo-navigation-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      // Sticky immersive: hide the nav bar; it reappears transiently on a
      // swipe from the bottom edge, then hides again.
      NavigationBar.setHidden(true);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
