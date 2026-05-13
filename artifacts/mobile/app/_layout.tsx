import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MealPlannerProvider } from "@/context/MealPlannerContext";
import { RecipeMakerProvider } from "@/context/RecipeMakerContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import { ShoppingListProvider } from "@/context/ShoppingListContext";
import { ThemeProvider } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const USE_NATIVE_DRIVER = Platform.OS !== "web";

function SplashAnimation({ onDone }: { onDone: () => void }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 350, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(titleY, { toValue: 0, duration: 350, useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
      Animated.delay(700),
      Animated.timing(fadeOut, { toValue: 0, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity: fadeOut }]}>
      <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity, alignItems: "center" }}>
        <View style={styles.splashLogoCircle}>
          <Text style={styles.splashEmoji}>🍽️</Text>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }], alignItems: "center", marginTop: 24 }}>
        <Text style={styles.splashTitle}>Recipe Finder</Text>
        <Text style={styles.splashSub}>Discover. Cook. Enjoy.</Text>
      </Animated.View>
    </Animated.View>
  );
}

function AuthGatedStack() {
  const { user, isLoading, hasSeenOnboarding } = useAuth();
  const segments = useSegments();

  if (isLoading) return null;

  const inAuth = segments[0] === "(auth)";
  const inOnboarding = segments[0] === "onboarding";

  if (!user && !inAuth && !inOnboarding) {
    return <Redirect href={hasSeenOnboarding ? "/(auth)/login" : "/onboarding"} />;
  }
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
    ...Ionicons.font,
    ...Feather.font,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });
  const [showSplash, setShowSplash] = useState(true);

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
                            {showSplash && (
                              <SplashAnimation onDone={() => setShowSplash(false)} />
                            )}
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

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  splashLogoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  splashEmoji: { fontSize: 52 },
  splashTitle: {
    fontSize: 30,
    fontFamily: "Figtree_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  splashSub: {
    fontSize: 14,
    fontFamily: "Figtree_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
    letterSpacing: 1,
  },
});
