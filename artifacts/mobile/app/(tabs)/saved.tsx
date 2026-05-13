import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFavorites } from "@/context/FavoritesContext";
import { useRecipeMaker } from "@/context/RecipeMakerContext";
import { useShoppingList } from "@/context/ShoppingListContext";
import { RECIPES } from "@/data/recipes";
import { useColors } from "@/hooks/useColors";
import { RecipeCard } from "@/components/RecipeCard";

type Tab = "favorites" | "myrecipes";

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favoriteIds } = useFavorites();
  const { userRecipes } = useRecipeMaker();
  const { items } = useShoppingList();
  const [activeTab, setActiveTab] = useState<Tab>("favorites");

  const favoriteRecipes = RECIPES.filter((r) => favoriteIds.includes(r.id));
  const allSaved = [
    ...userRecipes.filter((r) => favoriteIds.includes(r.id)),
    ...favoriteRecipes,
  ];

  const uncheckedCount = items.filter((i) => !i.checked).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Saved</Text>

        <View style={styles.quickLinks}>
          {[
            { label: "Shopping List", icon: "cart-outline" as const, badge: uncheckedCount, onPress: () => router.push("/shopping-list") },
            { label: "Meal Planner", icon: "calendar-outline" as const, badge: 0, onPress: () => router.push("/meal-planner") },
          ].map((link) => (
            <Pressable
              key={link.label}
              onPress={link.onPress}
              style={({ pressed }) => [
                styles.quickLink,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name={link.icon} size={20} color={colors.primary} />
              <Text style={[styles.quickLinkText, { color: colors.foreground }]}>{link.label}</Text>
              {link.badge > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{link.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <View style={styles.tabs}>
          {(["favorites", "myrecipes"] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? colors.primary : colors.mutedForeground },
                ]}
              >
                {tab === "favorites" ? "Favorites" : "My Recipes"}
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  {
                    backgroundColor: activeTab === tab ? colors.primary : colors.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    { color: activeTab === tab ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {tab === "favorites" ? favoriteIds.length : userRecipes.length}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {activeTab === "favorites" ? (
        <FlatList
          data={favoriteRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} variant="list" />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!favoriteRecipes.length}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="No favorites yet"
              subtitle="Tap the heart icon on any recipe to save it here"
              colors={colors}
            />
          }
        />
      ) : (
        <FlatList
          data={userRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} variant="list" />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!userRecipes.length}
          ListHeaderComponent={
            userRecipes.length > 0 ? (
              <Pressable
                onPress={() => router.push("/my-recipes")}
                style={[styles.manageBtn, { backgroundColor: colors.muted }]}
              >
                <Text style={[styles.manageBtnText, { color: colors.primary }]}>
                  Manage My Recipes
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="book-outline"
              title="No recipes created yet"
              subtitle="Go to Create tab to build your first recipe"
              colors={colors}
              cta="Create Recipe"
              onCta={() => router.push("/(tabs)/create")}
            />
          }
        />
      )}
    </View>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  colors,
  cta,
  onCta,
}: {
  icon: string;
  title: string;
  subtitle: string;
  colors: any;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <View style={emptyStyles.wrap}>
      <View style={[emptyStyles.iconWrap, { backgroundColor: colors.muted }]}>
        <Ionicons name={icon as any} size={36} color={colors.primary} />
      </View>
      <Text style={[emptyStyles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[emptyStyles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      {cta && onCta && (
        <Pressable
          onPress={onCta}
          style={({ pressed }) => [emptyStyles.ctaBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={emptyStyles.ctaText}>{cta}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 0, gap: 12 },
  title: { fontSize: 28, fontFamily: "Figtree_700Bold" },
  quickLinks: { gap: 8 },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickLinkText: { flex: 1, fontSize: 14, fontFamily: "Figtree_600SemiBold" },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Figtree_700Bold" },
  tabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E8E0D8" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 12, paddingTop: 4 },
  tabText: { fontSize: 15, fontFamily: "Figtree_600SemiBold" },
  tabBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, minWidth: 22, alignItems: "center" },
  tabBadgeText: { fontSize: 11, fontFamily: "Figtree_700Bold" },
  listContent: { paddingHorizontal: 20, paddingTop: 12 },
  manageBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, marginBottom: 12 },
  manageBtnText: { fontSize: 14, fontFamily: "Figtree_600SemiBold" },
});

const emptyStyles = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: 60, gap: 14, paddingHorizontal: 40 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Figtree_700Bold", textAlign: "center" },
  subtitle: { fontSize: 14, fontFamily: "Figtree_400Regular", textAlign: "center", lineHeight: 20 },
  ctaBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  ctaText: { color: "#fff", fontSize: 14, fontFamily: "Figtree_700Bold" },
});
