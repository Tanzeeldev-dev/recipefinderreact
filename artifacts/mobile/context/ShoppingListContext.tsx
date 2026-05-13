import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  recipeId?: string;
  recipeTitle?: string;
}

interface ShoppingListContextType {
  items: ShoppingItem[];
  addItem: (name: string, recipeId?: string, recipeTitle?: string) => void;
  addItemsFromRecipe: (ingredients: string[], recipeId: string, recipeTitle: string) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

const ShoppingListContext = createContext<ShoppingListContextType>({
  items: [],
  addItem: () => {},
  addItemsFromRecipe: () => {},
  toggleItem: () => {},
  removeItem: () => {},
  clearChecked: () => {},
  clearAll: () => {},
});

const STORAGE_KEY = "@shopping_list";

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setItems(JSON.parse(data));
    });
  }, []);

  const persist = async (newItems: ShoppingItem[]) => {
    setItems(newItems);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  const addItem = async (name: string, recipeId?: string, recipeTitle?: string) => {
    const item: ShoppingItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      checked: false,
      recipeId,
      recipeTitle,
    };
    await persist([...items, item]);
  };

  const addItemsFromRecipe = async (ingredients: string[], recipeId: string, recipeTitle: string) => {
    const newItems: ShoppingItem[] = ingredients.map((ing) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5) + Math.random(),
      name: ing,
      checked: false,
      recipeId,
      recipeTitle,
    }));
    await persist([...items, ...newItems]);
  };

  const toggleItem = async (id: string) => {
    await persist(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const removeItem = async (id: string) => {
    await persist(items.filter((i) => i.id !== id));
  };

  const clearChecked = async () => {
    await persist(items.filter((i) => !i.checked));
  };

  const clearAll = async () => {
    await persist([]);
  };

  return (
    <ShoppingListContext.Provider value={{ items, addItem, addItemsFromRecipe, toggleItem, removeItem, clearChecked, clearAll }}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  return useContext(ShoppingListContext);
}
