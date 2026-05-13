import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  CATEGORIES,
  getFeaturedRecipes,
  getRecipesByCategory,
  RECIPES,
} from "@/data/recipes";
import { useColors } from "@/hooks/useColors";
import { RecipeCard } from "@/components/RecipeCard";
import { CategoryCard } from "@/components/CategoryCard";
import { SkeletonRecipeCard } from "@/components/SkeletonCard";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const featuredRecipes = getFeaturedRecipes();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredRecipes =
    selectedCategory === "all"
      ? RECIPES.slice(0, 20)
      : getRecipesByCategory(selectedCategory);

  const displayedCategories = CATEGORIES.slice(0, 7);

  const getRecipeCountForCategory = (catId: string) => {
    if (catId === "all") return RECIPES.length;
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return 0;
    return RECIPES.filter(
      (r) => r.category.toLowerCase() === cat.name.toLowerCase()
    ).length;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop:
            insets.top + (Platform.OS === "web" ? 67 : 0),
          paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good morning
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Featured
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/search")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See all
            </Text>
          </Pressable>
        </View>
        {isLoading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {[1, 2, 3].map((i) => (
              <SkeletonRecipeCard key={i} variant="featured" />
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH * 0.7 + 12}
            snapToAlignment="start"
          >
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} variant="featured" />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Categories
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/categories")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See all
            </Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {displayedCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              recipeCount={getRecipeCountForCategory(cat.id)}
              onPress={() => setSelectedCategory(cat.id)}
              variant="pill"
              isSelected={selectedCategory === cat.id}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selectedCategory === "all"
              ? "Popular Recipes"
              : CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? "Recipes"}
          </Text>
          <Text style={[styles.recipeCount, { color: colors.mutedForeground }]}>
            {filteredRecipes.length} recipes
          </Text>
        </View>
        {isLoading ? (
          <View style={styles.compactGrid}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonRecipeCard key={i} variant="compact" />
            ))}
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No recipes in this category
            </Text>
          </View>
        ) : (
          <View style={styles.compactGrid}>
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} variant="compact" />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  searchIconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  recipeCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  featuredScroll: {
    paddingLeft: 16,
    paddingRight: 20,
    gap: 12,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  compactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
