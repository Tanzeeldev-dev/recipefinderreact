import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { SearchBar } from "@/components/SearchBar";
import { RecipeCard } from "@/components/RecipeCard";
import { useSearchMeals, useMealsByCategory, useDBCategories } from "@/hooks/useMealDB";
import { CATEGORY_META } from "@/lib/mealdb";
import { Pressable } from "react-native";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: allCategories = [] } = useDBCategories();
  const { data: searchResults = [], isLoading: searchLoading } = useSearchMeals(query);
  const { data: categoryResults = [], isLoading: catLoading } = useMealsByCategory(
    selectedCategory ?? "Chicken"
  );

  const isLoading = query.length > 0 ? searchLoading : catLoading;
  const results = query.length > 0 ? searchResults : categoryResults;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Discover</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Search thousands of real recipes
        </Text>
        <View style={styles.searchBarWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes..."
          />
        </View>

        {/* Category pills */}
        <FlatList
          data={allCategories.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.strCategory}
          contentContainerStyle={styles.categoriesWrap}
          renderItem={({ item }) => {
            const meta = CATEGORY_META[item.strCategory];
            const isSelected = selectedCategory === item.strCategory;
            return (
              <Pressable
                onPress={() =>
                  setSelectedCategory((prev) =>
                    prev === item.strCategory ? null : item.strCategory
                  )
                }
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={styles.pillEmoji}>{meta?.emoji ?? "🍽️"}</Text>
                <Text
                  style={[
                    styles.pillText,
                    { color: isSelected ? "#fff" : colors.foreground },
                  ]}
                >
                  {item.strCategory}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} variant="list" />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) },
          ]}
          showsVerticalScrollIndicator={false}
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
                name={query.length > 0 ? "search-outline" : "restaurant-outline"}
                size={56}
                color={colors.mutedForeground}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {query.length > 0 ? "No recipes found" : "Start searching"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                {query.length > 0
                  ? `No results for "${query}"`
                  : "Type a recipe name or pick a category"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontFamily: "Figtree_700Bold", marginBottom: 2 },
  subtitle: { fontSize: 14, fontFamily: "Figtree_400Regular", marginBottom: 16 },
  searchBarWrap: { marginBottom: 14 },
  categoriesWrap: { gap: 8, paddingBottom: 4 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: 12, fontFamily: "Figtree_600SemiBold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 20, paddingTop: 8 },
  resultsText: { fontSize: 13, fontFamily: "Figtree_500Medium", marginBottom: 12 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Figtree_700Bold", textAlign: "center" },
  emptySubtitle: { fontSize: 14, fontFamily: "Figtree_400Regular", textAlign: "center", lineHeight: 20 },
});
