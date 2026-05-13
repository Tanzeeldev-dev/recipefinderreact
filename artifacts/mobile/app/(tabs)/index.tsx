import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { RecipeCard } from "@/components/RecipeCard";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useRandomMeal, useMealsByCategory, useDBCategories } from "@/hooks/useMealDB";
import { CATEGORY_META } from "@/lib/mealdb";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TOP_CATEGORIES = ["Chicken", "Lamb", "Pork", "Beef", "Seafood", "Dessert", "Vegetarian", "Pasta"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Chicken");

  const { data: featuredMeal, isLoading: featuredLoading } = useRandomMeal();
  const { data: categoryMeals = [], isLoading: mealsLoading } = useMealsByCategory(selectedCategory);
  const { data: allCategories = [] } = useDBCategories();

  const visibleCategories = allCategories.length > 0
    ? allCategories.filter((c) => TOP_CATEGORIES.includes(c.strCategory)).slice(0, 8)
    : TOP_CATEGORIES.map((name) => ({ strCategory: name, strCategoryThumb: "", idCategory: name, strCategoryDescription: "" }));

  const firstName = user?.name?.split(" ")[0] ?? "Chef";
  const animalItems = [
    { cat: "Lamb", image: "https://i.postimg.cc/yxwNmjnn/lamb.png" },
    { cat: "Chicken", image: "https://i.postimg.cc/5yZtBgpr/chicken.png" },
    { cat: "Pork", emoji: "🐷" },
  ] as const;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
          paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Hello, {firstName} 👋
          </Text>
          <Text style={[styles.tagline, { color: colors.foreground }]}>
            What are you{"\n"}cooking today?
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/search")}
          style={[styles.searchIconBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="search" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Animal images (category quick-picks) */}
      <View style={styles.emojiRow}>
        {animalItems.map((item) => {
          const isActive = selectedCategory === item.cat;
          return (
            <Pressable
              key={item.cat}
              onPress={() => setSelectedCategory(item.cat)}
              style={[
                styles.emojiBtn,
                { backgroundColor: isActive ? colors.primary + "22" : "transparent" },
              ]}
            >
              {"image" in item ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.animalImage}
                  contentFit="contain"
                />
              ) : (
                <Text style={styles.emojiText}>{item.emoji}</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Featured */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured</Text>
          <View style={[styles.dayBadge, { backgroundColor: colors.primary + "18" }]}>
            <Text style={[styles.dayBadgeText, { color: colors.primary }]}>Daily Pick</Text>
          </View>
        </View>
        {featuredLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : featuredMeal ? (
          <View style={{ paddingHorizontal: 16 }}>
            <RecipeCard recipe={{ ...featuredMeal, isFeatured: true }} variant="featured" />
          </View>
        ) : null}
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {visibleCategories.map((cat) => {
            const meta = CATEGORY_META[cat.strCategory];
            const isSelected = selectedCategory === cat.strCategory;
            return (
              <Pressable
                key={cat.strCategory}
                onPress={() => setSelectedCategory(cat.strCategory)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={styles.categoryEmoji}>{meta?.emoji ?? "🍽️"}</Text>
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isSelected ? "#fff" : colors.foreground },
                  ]}
                >
                  {cat.strCategory}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Recipes for selected category */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selectedCategory}
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/search")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </Pressable>
        </View>
        {mealsLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={styles.compactGrid}>
            {categoryMeals.slice(0, 10).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} variant="compact" />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 14, fontFamily: "Figtree_500Medium", marginBottom: 4 },
  tagline: { fontSize: 26, fontFamily: "Figtree_700Bold", lineHeight: 32 },
  searchIconBtn: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", marginTop: 4 },
  emojiRow: { flexDirection: "row", justifyContent: "center", gap: 24, paddingVertical: 16 },
  emojiBtn: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  emojiText: { fontSize: 64, lineHeight: 80 },
  animalImage: { width: 80, height: 80 },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontFamily: "Figtree_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Figtree_600SemiBold" },
  dayBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dayBadgeText: { fontSize: 11, fontFamily: "Figtree_600SemiBold" },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  categoryEmoji: { fontSize: 16 },
  categoryPillText: { fontSize: 13, fontFamily: "Figtree_600SemiBold" },
  compactGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  loadingBox: { height: 180, alignItems: "center", justifyContent: "center" },
});
