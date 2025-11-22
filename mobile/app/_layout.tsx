/**
 * Root Layout
 *
 * This is the root layout for the Expo Router app.
 * Similar to Next.js app/layout.tsx
 *
 * @see https://docs.expo.dev/router/advanced/root-layout/
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.neutral[900],
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.neutral[50],
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
