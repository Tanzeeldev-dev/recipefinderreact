import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { RecipeMakerProvider } from "@/context/RecipeMakerContext";
import { ShoppingListProvider } from "@/context/ShoppingListContext";
import { MealPlannerProvider } from "@/context/MealPlannerContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGatedStack() {
  const { user, isLoading, hasSeenOnboarding } = useAuth();
  const segments = useSegments();

  // While auth is loading, show nothing (splash is still up)
  if (isLoading) return null;

  const inAuth = segments[0] === "(auth)";
  const inOnboarding = segments[0] === "onboarding";
  const inTabs = segments[0] === "(tabs)";

  // Redirect unauthenticated users
  if (!user && !inAuth && !inOnboarding) {
    return <Redirect href={hasSeenOnboarding ? "/(auth)/login" : "/onboarding"} />;
  }

  // Redirect authenticated users away from auth screens
  if (user && (inAuth || inOnboarding)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recipe/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="category/[name]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="my-recipes/index" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="shopping-list/index" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="meal-planner/index" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="timer" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <FavoritesProvider>
                  <RecipeMakerProvider>
                    <ShoppingListProvider>
                      <MealPlannerProvider>
                        <RecentlyViewedProvider>
                          <KeyboardProvider>
                            <AuthGatedStack />
                          </KeyboardProvider>
                        </RecentlyViewedProvider>
                      </MealPlannerProvider>
                    </ShoppingListProvider>
                  </RecipeMakerProvider>
                </FavoritesProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
