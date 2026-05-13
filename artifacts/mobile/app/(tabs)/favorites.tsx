import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "@/context/FavoritesContext";
import { RECIPES } from "@/data/recipes";
import { useColors } from "@/hooks/useColors";
import { RecipeCard } from "@/components/RecipeCard";

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favoriteIds, isLoading } = useFavorites();

  const favoriteRecipes = RECIPES.filter((r) => favoriteIds.includes(r.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={favoriteRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} variant="list" />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 12),
            paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={favoriteRecipes.length > 0}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Favorites
            </Text>
            {favoriteRecipes.length > 0 && (
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {favoriteRecipes.length} saved recipe{favoriteRecipes.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Ionicons
                  name="heart-outline"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No saved recipes yet
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
              >
                Tap the heart icon on any recipe to save it here for quick access
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Figtree_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Figtree_400Regular",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Figtree_700Bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Figtree_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
