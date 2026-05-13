import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecipeMaker, UserRecipe } from "@/context/RecipeMakerContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useColors } from "@/hooks/useColors";
import { Image } from "expo-image";

export default function MyRecipesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userRecipes, deleteRecipe } = useRecipeMaker();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleDelete = (recipe: UserRecipe) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Delete "${recipe.title}"?`)) {
        deleteRecipe(recipe.id);
      }
    } else {
      Alert.alert(
        "Delete Recipe",
        `Are you sure you want to delete "${recipe.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteRecipe(recipe.id) },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={userRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: 60 + (Platform.OS === "web" ? 34 : insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!userRecipes.length}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <View>
              <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.title, { color: colors.foreground }]}>My Recipes</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {userRecipes.length} recipe{userRecipes.length !== 1 ? "s" : ""} created
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/create")}
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image
              source={{ uri: item.image }}
              style={styles.recipeImage}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.recipeInfo}>
              <View style={styles.recipeBadgeRow}>
                <View style={[styles.catBadge, { backgroundColor: colors.primary + "18" }]}>
                  <Text style={[styles.catBadgeText, { color: colors.primary }]}>{item.category}</Text>
                </View>
                <View style={[styles.diffBadge, {
                  backgroundColor: item.difficulty === "Easy" ? "#E8F5E9" : item.difficulty === "Medium" ? "#FFF3E0" : "#FFEBEE"
                }]}>
                  <Text style={[styles.diffText, {
                    color: item.difficulty === "Easy" ? "#4CAF50" : item.difficulty === "Medium" ? "#FF9800" : "#F44336"
                  }]}>{item.difficulty}</Text>
                </View>
              </View>
              <Text style={[styles.recipeTitle, { color: colors.foreground }]} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.recipeMeta}>
                <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.time}m</Text>
                <Ionicons name="people-outline" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.servings}</Text>
              </View>
            </View>
            <View style={styles.recipeActions}>
              <Pressable onPress={() => toggleFavorite(item.id)} hitSlop={8}>
                <Ionicons
                  name={isFavorite(item.id) ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite(item.id) ? "#FF6B35" : colors.mutedForeground}
                />
              </Pressable>
              <Pressable onPress={() => router.push(`/recipe/${item.id}`)} hitSlop={8}>
                <Ionicons name="eye-outline" size={20} color={colors.mutedForeground} />
              </Pressable>
              <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No recipes yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Create your first recipe to see it here
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/create")}
              style={({ pressed }) => [styles.createFirstBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.createFirstBtnText}>Create Recipe</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
  backBtn: { width: 40, height: 40, justifyContent: "center", marginBottom: 4 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  createBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  recipeCard: { flexDirection: "row", borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  recipeImage: { width: 90, height: 90 },
  recipeInfo: { flex: 1, padding: 12, gap: 4, justifyContent: "center" },
  recipeBadgeRow: { flexDirection: "row", gap: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  recipeTitle: { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 19 },
  recipeMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  recipeActions: { paddingVertical: 12, paddingHorizontal: 10, gap: 16, justifyContent: "center" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 14, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  createFirstBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  createFirstBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
