import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CATEGORIES, getRecipesByCategory } from "@/data/recipes";
import { useColors } from "@/hooks/useColors";
import { RecipeCard } from "@/components/RecipeCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const category = CATEGORIES.find((c) => c.id === name);
  const recipes = getRecipesByCategory(name ?? "");
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: category?.bgColor ?? colors.muted,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: (category?.color ?? colors.primary) + "20" },
            ]}
          >
            <Ionicons
              name={(category?.icon ?? "restaurant") as any}
              size={32}
              color={category?.color ?? colors.primary}
            />
          </View>
          <Text style={[styles.categoryTitle, { color: colors.foreground }]}>
            {category?.name ?? name}
          </Text>
          <Text style={[styles.recipeCount, { color: colors.mutedForeground }]}>
            {recipes.length} recipes
          </Text>
        </View>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} variant="list" />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: 40 + (Platform.OS === "web" ? 34 : insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={recipes.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="restaurant-outline"
              size={56}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No recipes in this category yet
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
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerContent: {
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 24,
    fontFamily: "Figtree_700Bold",
  },
  recipeCount: {
    fontSize: 14,
    fontFamily: "Figtree_400Regular",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Figtree_400Regular",
  },
});
