import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMealPlanner, MealSlot } from "@/context/MealPlannerContext";
import { useColors } from "@/hooks/useColors";
import { RECIPES } from "@/data/recipes";
import { useRecipeMaker } from "@/context/RecipeMakerContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];
const SLOT_LABELS: Record<MealSlot, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
const SLOT_ICONS: Record<MealSlot, string> = { breakfast: "sunny-outline", lunch: "restaurant-outline", dinner: "moon-outline" };

function getWeekDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function MealPlannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { weekPlan, addToMealPlan, removeFromMealPlan, getMealForDay } = useMealPlanner();
  const { userRecipes } = useRecipeMaker();
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

  const weekDates = getWeekDates();
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = weekDates[selectedDayIndex];
  const dayPlan = getMealForDay(selectedDate);

  const allRecipes = [...RECIPES, ...userRecipes];

  const getRecipeForSlot = (slot: MealSlot) => {
    const id = dayPlan[slot];
    if (!id) return null;
    return allRecipes.find((r) => r.id === id) ?? null;
  };

  const handleAddMeal = (slot: MealSlot) => {
    // Show a simple recipe picker - just pick a random featured one for demo
    const featured = allRecipes.filter((r) => "isFeatured" in r ? r.isFeatured : true).slice(0, 10);
    if (Platform.OS === "web") {
      const options = featured.map((r, i) => `${i + 1}. ${r.title}`).join("\n");
      const input = window.prompt(`Pick a recipe for ${SLOT_LABELS[slot]}:\n${options}\n\nEnter number:`);
      if (input) {
        const idx = parseInt(input) - 1;
        if (idx >= 0 && idx < featured.length) {
          addToMealPlan(selectedDate, slot, featured[idx].id);
        }
      }
    } else {
      Alert.alert(
        `Add to ${SLOT_LABELS[slot]}`,
        "Choose a recipe",
        [
          ...featured.slice(0, 6).map((r) => ({
            text: r.title,
            onPress: () => addToMealPlan(selectedDate, slot, r.id),
          })),
          { text: "Cancel", style: "cancel" as const },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: 60 + (Platform.OS === "web" ? 34 : insets.bottom),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>Meal Planner</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Plan your week ahead</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
        {DAYS.map((day, index) => {
          const date = weekDates[index];
          const isToday = date === today;
          const isSelected = index === selectedDayIndex;
          const hasMeals = Object.keys(weekPlan[date] ?? {}).length > 0;
          return (
            <Pressable
              key={day}
              onPress={() => setSelectedDayIndex(index)}
              style={[
                styles.dayBtn,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.dayLabel, { color: isSelected ? "#fff" : colors.mutedForeground }]}>
                {day}
              </Text>
              <Text style={[styles.dayNum, { color: isSelected ? "#fff" : colors.foreground }]}>
                {parseInt(date.slice(8))}
              </Text>
              {hasMeals && (
                <View style={[styles.mealDot, { backgroundColor: isSelected ? "rgba(255,255,255,0.8)" : colors.primary }]} />
              )}
              {isToday && !isSelected && (
                <View style={[styles.todayLine, { backgroundColor: colors.primary }]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.dayTitle, { color: colors.foreground }]}>
        {DAYS[selectedDayIndex]}, {selectedDate.slice(5).replace("-", "/")}
        {selectedDate === today && " · Today"}
      </Text>

      {SLOTS.map((slot) => {
        const recipe = getRecipeForSlot(slot);
        return (
          <View key={slot} style={[styles.slotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.slotHeader}>
              <Ionicons name={SLOT_ICONS[slot] as any} size={16} color={colors.mutedForeground} />
              <Text style={[styles.slotLabel, { color: colors.mutedForeground }]}>{SLOT_LABELS[slot]}</Text>
            </View>
            {recipe ? (
              <View style={styles.slotRecipe}>
                <Pressable
                  onPress={() => router.push(`/recipe/${recipe.id}`)}
                  style={styles.slotRecipeContent}
                >
                  <Text style={[styles.slotRecipeTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {recipe.title}
                  </Text>
                  <View style={styles.slotMeta}>
                    <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.slotMetaText, { color: colors.mutedForeground }]}>{recipe.time}m</Text>
                    <Ionicons name="flame-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.slotMetaText, { color: colors.mutedForeground }]}>{recipe.calories} cal</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => removeFromMealPlan(selectedDate, slot)}
                  hitSlop={8}
                  style={[styles.removeBtn, { backgroundColor: "#FFEBEE" }]}
                >
                  <Ionicons name="close" size={16} color="#F44336" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => handleAddMeal(slot)}
                style={[styles.addSlotBtn, { borderColor: colors.border }]}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.addSlotText, { color: colors.primary }]}>Add {SLOT_LABELS[slot]}</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 12 },
  navRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 26, fontFamily: "Figtree_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Figtree_400Regular" },
  dayPicker: { flexGrow: 0, marginVertical: 4 },
  dayBtn: { alignItems: "center", padding: 10, borderRadius: 14, marginRight: 8, borderWidth: 1, minWidth: 54, gap: 2 },
  dayLabel: { fontSize: 11, fontFamily: "Figtree_500Medium" },
  dayNum: { fontSize: 18, fontFamily: "Figtree_700Bold" },
  mealDot: { width: 5, height: 5, borderRadius: 3 },
  todayLine: { width: 16, height: 2, borderRadius: 1 },
  dayTitle: { fontSize: 16, fontFamily: "Figtree_700Bold", marginTop: 4 },
  slotCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  slotHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  slotLabel: { fontSize: 12, fontFamily: "Figtree_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  slotRecipe: { flexDirection: "row", alignItems: "center", gap: 10 },
  slotRecipeContent: { flex: 1, gap: 4 },
  slotRecipeTitle: { fontSize: 15, fontFamily: "Figtree_700Bold", lineHeight: 20 },
  slotMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  slotMetaText: { fontSize: 12, fontFamily: "Figtree_400Regular" },
  removeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  addSlotBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderStyle: "dashed", justifyContent: "center" },
  addSlotText: { fontSize: 14, fontFamily: "Figtree_600SemiBold" },
});
