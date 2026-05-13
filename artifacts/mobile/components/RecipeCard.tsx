import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFavorites } from "@/context/FavoritesContext";
import { useColors } from "@/hooks/useColors";
import { Recipe } from "@/data/recipes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const COMPACT_CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface RecipeCardProps {
  recipe: Recipe;
  variant?: "featured" | "compact" | "list";
}

export function RecipeCard({ recipe, variant = "compact" }: RecipeCardProps) {
  const colors = useColors();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);

  const handlePress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleFavorite = (e: { stopPropagation?: () => void }) => {
    toggleFavorite(recipe.id);
  };

  if (variant === "featured") {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.featuredCard,
          { opacity: pressed ? 0.95 : 1 },
        ]}
      >
        <Image
          source={{ uri: recipe.image }}
          style={styles.featuredImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.75)"]}
          style={styles.featuredGradient}
        />
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>{recipe.category}</Text>
        </View>
        <Pressable
          onPress={handleFavorite}
          style={styles.featuredFavBtn}
          hitSlop={10}
        >
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={22}
            color={favorited ? "#FF6B35" : "#fff"}
          />
        </Pressable>
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {recipe.title}
          </Text>
          <View style={styles.featuredMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{recipe.time}m</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={13} color="#FFB300" />
              <Text style={styles.metaText}>{recipe.rating}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{recipe.calories} cal</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === "list") {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.listCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Image
          source={{ uri: recipe.image }}
          style={styles.listImage}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.listInfo}>
          <Text
            style={[styles.listCategory, { color: colors.primary }]}
            numberOfLines={1}
          >
            {recipe.category}
          </Text>
          <Text
            style={[styles.listTitle, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {recipe.title}
          </Text>
          <View style={styles.listMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.listMetaText, { color: colors.mutedForeground }]}>
                {recipe.time}m
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={13} color="#FFB300" />
              <Text style={[styles.listMetaText, { color: colors.mutedForeground }]}>
                {recipe.rating}
              </Text>
            </View>
            <Text
              style={[
                styles.difficultyBadge,
                {
                  color:
                    recipe.difficulty === "Easy"
                      ? "#4CAF50"
                      : recipe.difficulty === "Medium"
                      ? "#FF9800"
                      : "#F44336",
                  backgroundColor:
                    recipe.difficulty === "Easy"
                      ? "#E8F5E9"
                      : recipe.difficulty === "Medium"
                      ? "#FFF3E0"
                      : "#FFEBEE",
                },
              ]}
            >
              {recipe.difficulty}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleFavorite} style={styles.listFavBtn} hitSlop={10}>
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={22}
            color={favorited ? "#FF6B35" : colors.mutedForeground}
          />
        </Pressable>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.compactCard,
        {
          backgroundColor: colors.card,
          width: COMPACT_CARD_WIDTH,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Image
        source={{ uri: recipe.image }}
        style={styles.compactImage}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)"]}
        style={styles.compactGradient}
      />
      <Pressable
        onPress={handleFavorite}
        style={styles.compactFavBtn}
        hitSlop={10}
      >
        <Ionicons
          name={favorited ? "heart" : "heart-outline"}
          size={18}
          color={favorited ? "#FF6B35" : "#fff"}
        />
      </Pressable>
      <View style={styles.compactInfo}>
        <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.compactMeta}>
          <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
          <Text style={[styles.compactTime, { color: colors.mutedForeground }]}>
            {recipe.time}m
          </Text>
          <Ionicons name="star" size={11} color="#FFB300" />
          <Text style={[styles.compactTime, { color: colors.mutedForeground }]}>
            {recipe.rating}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featuredCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginLeft: 8,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    top: "30%",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  featuredBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  featuredFavBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  featuredMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  compactCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  compactImage: {
    width: "100%",
    height: 130,
  },
  compactGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 130,
  },
  compactFavBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  compactInfo: {
    padding: 10,
  },
  compactTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
    lineHeight: 18,
  },
  compactMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  compactTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  listCard: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
  },
  listImage: {
    width: 100,
    height: 100,
  },
  listInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    gap: 3,
  },
  listCategory: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    lineHeight: 20,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  listMetaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  difficultyBadge: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  listFavBtn: {
    paddingHorizontal: 12,
    alignSelf: "center",
  },
});
