import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CATEGORIES, searchRecipes } from "@/data/recipes";
import { useColors } from "@/hooks/useColors";
import { SearchBar } from "@/components/SearchBar";
import { RecipeCard } from "@/components/RecipeCard";
import { CategoryCard } from "@/components/CategoryCard";
import { RECIPES } from "@/data/recipes";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const results = useMemo(() => {
    return searchRecipes(query, selectedCategory);
  }, [query, selectedCategory]);

  const getRecipeCountForCategory = (catId: string) => {
    if (catId === "all") return RECIPES.length;
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return 0;
    return RECIPES.filter(
      (r) => r.category.toLowerCase() === cat.name.toLowerCase()
    ).length;
  };

  const isSearching = query.length > 0;
  const hasResults = results.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 12),
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Discover
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Find your perfect recipe
        </Text>
        <View style={styles.searchBarWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search 28 recipes..."
          />
        </View>
        <View style={styles.categoriesWrap}>
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              recipeCount={getRecipeCountForCategory(cat.id)}
              onPress={() =>
                setSelectedCategory((prev) =>
                  prev === cat.id ? "all" : cat.id
                )
              }
              variant="pill"
              isSelected={selectedCategory === cat.id}
            />
          ))}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} variant="list" />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={results.length > 0}
        ListHeaderComponent={
          results.length > 0 ? (
            <Text style={[styles.resultsText, { color: colors.mutedForeground }]}>
              {results.length} recipe{results.length !== 1 ? "s" : ""} found
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={isSearching ? "search-outline" : "restaurant-outline"}
              size={56}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {isSearching ? "No recipes found" : "Start searching"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              {isSearching
                ? `No results for "${query}"`
                : "Type a recipe name, ingredient, or category"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  searchBarWrap: {
    marginBottom: 14,
  },
  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  resultsText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
