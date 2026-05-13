import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "@/context/FavoritesContext";
import { useShoppingList } from "@/context/ShoppingListContext";
import { useMealPlanner } from "@/context/MealPlannerContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useRecipeMaker } from "@/context/RecipeMakerContext";
import { getRecipeById, RECIPES } from "@/data/recipes";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 320;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItemsFromRecipe } = useShoppingList();
  const { addToMealPlan } = useMealPlanner();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { getRecipeById: getUserRecipe } = useRecipeMaker();

  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">("ingredients");
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [shoppingAdded, setShoppingAdded] = useState(false);

  const staticRecipe = id ? getRecipeById(id) : undefined;
  const userRecipe = id ? getUserRecipe(id) : undefined;
  const recipe = staticRecipe ?? userRecipe;

  useEffect(() => {
    if (id) {
      addRecentlyViewed(id);
    }
  }, [id]);

  if (!recipe) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Recipe not found</Text>
        <Pressable onPress={() => router.back()} style={[styles.backLinkBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const favorited = isFavorite(recipe.id);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const toggleStep = (index: number) => {
    const next = new Set(doneSteps);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setDoneSteps(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddToShoppingList = async () => {
    await addItemsFromRecipe(recipe.ingredients, recipe.id, recipe.title);
    setShoppingAdded(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setShoppingAdded(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: recipe.title,
        message: `Check out this recipe: ${recipe.title}\n\nIngredients:\n${recipe.ingredients.join("\n")}\n\nSteps:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      });
    } catch {}
  };

  const adjustedServings = Math.round(recipe.servings * servingMultiplier);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) }}
        bounces
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <View style={[styles.heroPlaceholder, { backgroundColor: colors.muted }]}>
            <Image
              source={{ uri: recipe.image }}
              style={styles.heroImage}
              contentFit="cover"
              transition={400}
            />
          </View>
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.25)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroButtons, { top: topPad + 12 }]}>
            <Pressable onPress={() => router.back()} style={styles.heroBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.heroBtnGroup}>
              <Pressable onPress={handleShare} style={styles.heroBtn} hitSlop={8}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </Pressable>
              <Pressable onPress={() => toggleFavorite(recipe.id)} style={styles.heroBtn} hitSlop={8}>
                <Ionicons name={favorited ? "heart" : "heart-outline"} size={22} color={favorited ? "#FF6B35" : "#fff"} />
              </Pressable>
            </View>
          </View>
          <View style={styles.heroBadges}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{recipe.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: recipe.difficulty === "Easy" ? "#4CAF50" : recipe.difficulty === "Medium" ? "#FF9800" : "#F44336" }]}>
              <Text style={styles.badgeText}>{recipe.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{recipe.title}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFB300" />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>{recipe.rating || "New"}</Text>
            <Text style={[styles.ratingLabel, { color: colors.mutedForeground }]}>Rating</Text>
          </View>

          {/* Info Chips */}
          <View style={styles.infoChips}>
            <InfoChip icon="time-outline" label="Time" value={`${recipe.time}m`} colors={colors} />
            <InfoChip icon="people-outline" label="Serves" value={`${adjustedServings}`} colors={colors} />
            {recipe.calories > 0 && (
              <InfoChip icon="flame-outline" label="Cal" value={`${recipe.calories}`} colors={colors} />
            )}
          </View>

          {/* Serving Adjuster */}
          <View style={[styles.servingRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.servingLabel, { color: colors.mutedForeground }]}>Adjust Servings</Text>
            <View style={styles.servingControls}>
              <Pressable
                onPress={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
                style={[styles.servingBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                hitSlop={4}
              >
                <Ionicons name="remove" size={16} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.servingValue, { color: colors.foreground }]}>
                {adjustedServings}
              </Text>
              <Pressable
                onPress={() => setServingMultiplier(servingMultiplier + 0.5)}
                style={[styles.servingBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                hitSlop={4}
              >
                <Ionicons name="add" size={16} color={colors.foreground} />
              </Pressable>
            </View>
          </View>

          <Text style={[styles.description, { color: colors.mutedForeground }]}>{recipe.description}</Text>

          {/* Action Buttons */}
          <View style={styles.actionBtns}>
            <Pressable
              onPress={handleAddToShoppingList}
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: shoppingAdded ? "#4CAF50" : colors.secondary,
                  borderColor: shoppingAdded ? "#4CAF50" : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons name={shoppingAdded ? "checkmark" : "cart-outline"} size={18} color={shoppingAdded ? "#fff" : colors.accent} />
              <Text style={[styles.actionBtnText, { color: shoppingAdded ? "#fff" : colors.accent }]}>
                {shoppingAdded ? "Added!" : "Shopping List"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(`/timer?minutes=${recipe.time}`)}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.muted, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="timer-outline" size={18} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Cook Timer</Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            {(["ingredients", "steps"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                ]}
              >
                <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
                  {tab === "ingredients" ? "Ingredients" : "Instructions"}
                </Text>
                <Text style={[styles.tabCount, { backgroundColor: activeTab === tab ? colors.primary : colors.muted, color: activeTab === tab ? "#fff" : colors.mutedForeground }]}>
                  {tab === "ingredients" ? recipe.ingredients.length : recipe.steps.length}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "ingredients" ? (
            <View style={styles.list}>
              {recipe.ingredients.map((ing, index) => (
                <View key={index} style={[styles.ingredientItem, { borderBottomColor: colors.border }]}>
                  <View style={[styles.ingredientDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.ingredientText, { color: colors.foreground }]}>{ing}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.list}>
              {recipe.steps.map((step, index) => {
                const done = doneSteps.has(index);
                return (
                  <Pressable key={index} onPress={() => toggleStep(index)} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: done ? "#4CAF50" : colors.primary }]}>
                      {done ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : (
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      )}
                    </View>
                    <Text style={[styles.stepText, { color: done ? colors.mutedForeground : colors.foreground, textDecorationLine: done ? "line-through" : "none" }]}>
                      {step}
                    </Text>
                  </Pressable>
                );
              })}
              {doneSteps.size > 0 && (
                <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                  {doneSteps.size}/{recipe.steps.length} steps done
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoChip({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={[styles.chip, { backgroundColor: colors.muted }]}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <Text style={[styles.chipValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroContainer: { height: HERO_HEIGHT, position: "relative" },
  heroPlaceholder: { width: SCREEN_WIDTH, height: HERO_HEIGHT },
  heroImage: { width: SCREEN_WIDTH, height: HERO_HEIGHT },
  heroButtons: { position: "absolute", left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
  heroBtnGroup: { flexDirection: "row", gap: 8 },
  heroBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  heroBadges: { position: "absolute", bottom: 16, left: 16, flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  content: { borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: 24, gap: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 32 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  ratingLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  infoChips: { flexDirection: "row", gap: 12 },
  chip: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, gap: 4 },
  chipValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  chipLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  servingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  servingLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  servingControls: { flexDirection: "row", alignItems: "center", gap: 16 },
  servingBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  servingValue: { fontSize: 18, fontFamily: "Inter_700Bold", minWidth: 24, textAlign: "center" },
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  actionBtns: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E8E0D8" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 12 },
  tabText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  tabCount: { fontSize: 11, fontFamily: "Inter_700Bold", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  list: { gap: 0 },
  ingredientItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  ingredientDot: { width: 8, height: 8, borderRadius: 4 },
  ingredientText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  stepItem: { flexDirection: "row", gap: 14, marginBottom: 16 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  stepNumberText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  progressText: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center", paddingTop: 8 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  notFoundText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  backLinkBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backLinkText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
