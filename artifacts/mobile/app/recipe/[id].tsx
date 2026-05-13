import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { useFavorites } from "@/context/FavoritesContext";
import { getRecipeById } from "@/data/recipes";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 320;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    "ingredients"
  );

  const recipe = getRecipeById(id ?? "");

  if (!recipe) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>
          Recipe not found
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const favorited = isFavorite(recipe.id);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) }}
        bounces={true}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: recipe.image }}
            style={styles.heroImage}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.2)"]}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[styles.heroButtons, { top: topPad + 12 }]}
          >
            <Pressable
              onPress={() => router.back()}
              style={styles.heroBtn}
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => toggleFavorite(recipe.id)}
              style={styles.heroBtn}
              hitSlop={8}
            >
              <Ionicons
                name={favorited ? "heart" : "heart-outline"}
                size={22}
                color={favorited ? "#FF6B35" : "#fff"}
              />
            </Pressable>
          </View>
          <View style={styles.heroBadges}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{recipe.category}</Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    recipe.difficulty === "Easy"
                      ? "#4CAF50"
                      : recipe.difficulty === "Medium"
                      ? "#FF9800"
                      : "#F44336",
                },
              ]}
            >
              <Text style={styles.badgeText}>{recipe.difficulty}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {recipe.title}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFB300" />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>
              {recipe.rating}
            </Text>
            <Text style={[styles.ratingLabel, { color: colors.mutedForeground }]}>
              Rating
            </Text>
          </View>

          <View style={styles.infoChips}>
            <InfoChip
              icon="time-outline"
              label="Time"
              value={`${recipe.time} min`}
              colors={colors}
            />
            <InfoChip
              icon="people-outline"
              label="Serves"
              value={`${recipe.servings}`}
              colors={colors}
            />
            <InfoChip
              icon="flame-outline"
              label="Calories"
              value={`${recipe.calories}`}
              colors={colors}
            />
          </View>

          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {recipe.description}
          </Text>

          <View style={styles.tabBar}>
            <Pressable
              onPress={() => setActiveTab("ingredients")}
              style={[
                styles.tab,
                activeTab === "ingredients" && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "ingredients"
                        ? colors.primary
                        : colors.mutedForeground,
                  },
                ]}
              >
                Ingredients
              </Text>
              <Text
                style={[
                  styles.tabCount,
                  {
                    backgroundColor:
                      activeTab === "ingredients"
                        ? colors.primary
                        : colors.muted,
                    color:
                      activeTab === "ingredients"
                        ? "#fff"
                        : colors.mutedForeground,
                  },
                ]}
              >
                {recipe.ingredients.length}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("steps")}
              style={[
                styles.tab,
                activeTab === "steps" && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "steps"
                        ? colors.primary
                        : colors.mutedForeground,
                  },
                ]}
              >
                Instructions
              </Text>
              <Text
                style={[
                  styles.tabCount,
                  {
                    backgroundColor:
                      activeTab === "steps" ? colors.primary : colors.muted,
                    color:
                      activeTab === "steps" ? "#fff" : colors.mutedForeground,
                  },
                ]}
              >
                {recipe.steps.length}
              </Text>
            </Pressable>
          </View>

          {activeTab === "ingredients" ? (
            <View style={styles.list}>
              {recipe.ingredients.map((ing, index) => (
                <View
                  key={index}
                  style={[
                    styles.ingredientItem,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.ingredientDot,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                  <Text
                    style={[styles.ingredientText, { color: colors.foreground }]}
                  >
                    {ing}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.list}>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepNumber,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text
                    style={[styles.stepText, { color: colors.foreground }]}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoChip({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: colors.muted }]}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <Text style={[styles.chipValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroButtons: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadges: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  ratingLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  infoChips: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 4,
  },
  chipValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  chipLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 24,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0D8",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  tabCount: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  list: {
    gap: 0,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
