import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const { width: W } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "restaurant" as const,
    title: "Discover Amazing Recipes",
    subtitle: "Explore hundreds of handpicked recipes from around the world, from quick breakfasts to gourmet dinners.",
    color: "#7C3AED",
  },
  {
    icon: "create" as const,
    title: "Create Your Own Recipes",
    subtitle: "Build and save your own recipes, adjust ingredients, and share your culinary creations.",
    color: "#5B21B6",
  },
  {
    icon: "calendar" as const,
    title: "Plan Your Meals",
    subtitle: "Organize your weekly meals, build shopping lists, and set cooking timers — all in one place.",
    color: "#7C3AED",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markOnboardingSeen } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      scrollRef.current?.scrollTo({ x: next * W, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await markOnboardingSeen();
    router.replace("/(auth)/login");
  };

  const slide = SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width: W }]}>
            <View style={[styles.iconWrap, { backgroundColor: s.color + "18" }]}>
              <View style={[styles.iconCircle, { backgroundColor: s.color }]}>
                <Ionicons name={s.icon} size={52} color="#fff" />
              </View>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>{s.title}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
            paddingTop: 24,
          },
        ]}
      >
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? colors.primary : colors.border,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        {currentIndex < SLIDES.length - 1 && (
          <Pressable onPress={handleFinish} hitSlop={8}>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  iconWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Figtree_700Bold",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Figtree_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 32,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Figtree_700Bold",
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Figtree_500Medium",
  },
});
