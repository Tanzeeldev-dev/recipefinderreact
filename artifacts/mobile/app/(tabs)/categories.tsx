import React from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CATEGORIES, RECIPES } from "@/data/recipes";
import { useColors } from "@/hooks/useColors";
import { CategoryCard } from "@/components/CategoryCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const categoriesWithCount = CATEGORIES.filter((c) => c.id !== "all").map((cat) => ({
    ...cat,
    count: RECIPES.filter(
      (r) => r.category.toLowerCase() === cat.name.toLowerCase()
    ).length,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={categoriesWithCount}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 12),
            paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Categories
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Browse recipes by type
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <CategoryCard
              category={item}
              recipeCount={item.count}
              onPress={() => router.push(`/category/${item.id}`)}
              variant="grid"
            />
          </View>
        )}
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
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
});
