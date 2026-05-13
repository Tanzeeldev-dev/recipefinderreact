import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Recipe } from "@/data/recipes";

export interface UserRecipe extends Recipe {
  isUserCreated: true;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  cuisineType?: string;
  prepTime?: number;
}

interface RecipeMakerContextType {
  userRecipes: UserRecipe[];
  saveRecipe: (recipe: Omit<UserRecipe, "id" | "isUserCreated" | "createdAt" | "updatedAt">) => Promise<UserRecipe>;
  updateRecipe: (id: string, recipe: Partial<UserRecipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipeById: (id: string) => UserRecipe | undefined;
}

const RecipeMakerContext = createContext<RecipeMakerContextType>({
  userRecipes: [],
  saveRecipe: async () => ({} as UserRecipe),
  updateRecipe: async () => {},
  deleteRecipe: async () => {},
  getRecipeById: () => undefined,
});

const STORAGE_KEY = "@user_recipes";

export function RecipeMakerProvider({ children }: { children: React.ReactNode }) {
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setUserRecipes(JSON.parse(data));
    });
  }, []);

  const persist = async (recipes: UserRecipe[]) => {
    setUserRecipes(recipes);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  };

  const saveRecipe = async (
    recipe: Omit<UserRecipe, "id" | "isUserCreated" | "createdAt" | "updatedAt">
  ): Promise<UserRecipe> => {
    const now = new Date().toISOString();
    const newRecipe: UserRecipe = {
      ...recipe,
      id: "user_" + Date.now().toString() + Math.random().toString(36).substr(2, 6),
      isUserCreated: true,
      createdAt: now,
      updatedAt: now,
    };
    await persist([newRecipe, ...userRecipes]);
    return newRecipe;
  };

  const updateRecipe = async (id: string, updates: Partial<UserRecipe>) => {
    const updated = userRecipes.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    await persist(updated);
  };

  const deleteRecipe = async (id: string) => {
    await persist(userRecipes.filter((r) => r.id !== id));
  };

  const getRecipeById = useCallback(
    (id: string) => userRecipes.find((r) => r.id === id),
    [userRecipes]
  );

  return (
    <RecipeMakerContext.Provider value={{ userRecipes, saveRecipe, updateRecipe, deleteRecipe, getRecipeById }}>
      {children}
    </RecipeMakerContext.Provider>
  );
}

export function useRecipeMaker() {
  return useContext(RecipeMakerContext);
}
