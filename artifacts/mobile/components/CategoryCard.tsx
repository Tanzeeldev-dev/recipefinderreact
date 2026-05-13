import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Category } from "@/data/recipes";

interface CategoryCardProps {
  category: Category;
  recipeCount: number;
  onPress: () => void;
  variant?: "pill" | "grid";
  isSelected?: boolean;
}

export function CategoryCard({
  category,
  recipeCount,
  onPress,
  variant = "grid",
  isSelected = false,
}: CategoryCardProps) {
  const colors = useColors();

  if (variant === "pill") {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          {
            backgroundColor: isSelected ? category.color : colors.card,
            borderColor: isSelected ? category.color : colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons
          name={category.icon as any}
          size={14}
          color={isSelected ? "#fff" : category.color}
        />
        <Text
          style={[
            styles.pillText,
            {
              color: isSelected ? "#fff" : colors.foreground,
            },
          ]}
        >
          {category.name}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.gridCard,
        {
          backgroundColor: category.bgColor,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: category.color + "20" },
        ]}
      >
        <Ionicons name={category.icon as any} size={28} color={category.color} />
      </View>
      <Text style={[styles.gridName, { color: colors.foreground }]}>
        {category.name}
      </Text>
      <Text style={[styles.gridCount, { color: colors.mutedForeground }]}>
        {recipeCount} recipes
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  gridCard: {
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    gap: 8,
    aspectRatio: 1,
    justifyContent: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  gridName: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  gridCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
