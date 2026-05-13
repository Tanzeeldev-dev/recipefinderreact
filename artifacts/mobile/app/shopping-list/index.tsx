import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShoppingList, ShoppingItem } from "@/context/ShoppingListContext";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

export default function ShoppingListScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, addItem, toggleItem, removeItem, clearChecked, clearAll } = useShoppingList();
  const [newItem, setNewItem] = useState("");

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem(newItem.trim());
    setNewItem("");
  };

  const handleToggle = async (id: string) => {
    await toggleItem(id);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const allItems = [...unchecked, ...checked];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={allItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!allItems.length}
        ListHeaderComponent={
          <>
            <View style={styles.navRow}>
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <Ionicons name="chevron-back" size={24} color={colors.foreground} />
              </Pressable>
              {items.length > 0 && (
                <View style={styles.actionBtns}>
                  {checked.length > 0 && (
                    <Pressable onPress={clearChecked} style={[styles.actionBtn, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Clear done</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={clearAll} style={[styles.actionBtn, { backgroundColor: "#FFEBEE" }]}>
                    <Text style={[styles.actionBtnText, { color: "#F44336" }]}>Clear all</Text>
                  </Pressable>
                </View>
              )}
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Shopping List</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {unchecked.length} item{unchecked.length !== 1 ? "s" : ""} remaining
            </Text>
            <View style={[styles.addRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                style={[styles.addInput, { color: colors.foreground }]}
                value={newItem}
                onChangeText={setNewItem}
                placeholder="Add an item..."
                placeholderTextColor={colors.mutedForeground}
                onSubmitEditing={handleAdd}
                returnKeyType="done"
              />
              <Pressable
                onPress={handleAdd}
                style={({ pressed }) => [
                  styles.addBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </Pressable>
            </View>
            {checked.length > 0 && unchecked.length > 0 && (
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                {unchecked.length} REMAINING
              </Text>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          const showCheckedHeader = item.checked && (index === 0 || !allItems[index - 1].checked);
          return (
            <>
              {showCheckedHeader && (
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 12 }]}>
                  {checked.length} COMPLETED
                </Text>
              )}
              <Pressable
                onPress={() => handleToggle(item.id)}
                style={({ pressed }) => [
                  styles.itemRow,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Pressable
                  onPress={() => handleToggle(item.id)}
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: item.checked ? colors.primary : "transparent",
                      borderColor: item.checked ? colors.primary : colors.border,
                    },
                  ]}
                  hitSlop={4}
                >
                  {item.checked && <Ionicons name="checkmark" size={14} color="#fff" />}
                </Pressable>
                <View style={styles.itemInfo}>
                  <Text
                    style={[
                      styles.itemName,
                      {
                        color: item.checked ? colors.mutedForeground : colors.foreground,
                        textDecorationLine: item.checked ? "line-through" : "none",
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                  {item.recipeTitle && (
                    <Text style={[styles.itemRecipe, { color: colors.mutedForeground }]}>
                      From: {item.recipeTitle}
                    </Text>
                  )}
                </View>
                <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                  <Ionicons name="close" size={18} color={colors.mutedForeground} />
                </Pressable>
              </Pressable>
            </>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your list is empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Add items above, or tap "Add to Shopping List" from any recipe
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 8 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  actionBtns: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 4 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  addInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 8 },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 20 },
  itemRecipe: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 14, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
