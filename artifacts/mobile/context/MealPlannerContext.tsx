import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export interface DayPlan {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

type WeekPlan = Record<string, DayPlan>; // key = "YYYY-MM-DD"

interface MealPlannerContextType {
  weekPlan: WeekPlan;
  addToMealPlan: (date: string, slot: MealSlot, recipeId: string) => void;
  removeFromMealPlan: (date: string, slot: MealSlot) => void;
  getMealForDay: (date: string) => DayPlan;
}

const MealPlannerContext = createContext<MealPlannerContextType>({
  weekPlan: {},
  addToMealPlan: () => {},
  removeFromMealPlan: () => {},
  getMealForDay: () => ({}),
});

const STORAGE_KEY = "@meal_planner";

export function MealPlannerProvider({ children }: { children: React.ReactNode }) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setWeekPlan(JSON.parse(data));
    });
  }, []);

  const persist = async (plan: WeekPlan) => {
    setWeekPlan(plan);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  };

  const addToMealPlan = async (date: string, slot: MealSlot, recipeId: string) => {
    const updated = { ...weekPlan, [date]: { ...(weekPlan[date] ?? {}), [slot]: recipeId } };
    await persist(updated);
  };

  const removeFromMealPlan = async (date: string, slot: MealSlot) => {
    const day = { ...(weekPlan[date] ?? {}) };
    delete day[slot];
    const updated = { ...weekPlan, [date]: day };
    await persist(updated);
  };

  const getMealForDay = (date: string): DayPlan => weekPlan[date] ?? {};

  return (
    <MealPlannerContext.Provider value={{ weekPlan, addToMealPlan, removeFromMealPlan, getMealForDay }}>
      {children}
    </MealPlannerContext.Provider>
  );
}

export function useMealPlanner() {
  return useContext(MealPlannerContext);
}
