import { useQuery } from "@tanstack/react-query";
import {
  searchMeals,
  getMealById,
  getRandomMeal,
  getMealsByCategory,
  getDBCategories,
  getMealsByLetter,
} from "@/lib/mealdb";

export function useSearchMeals(query: string) {
  return useQuery({
    queryKey: ["meals", "search", query],
    queryFn: () => (query.trim() ? searchMeals(query) : getMealsByLetter("b")),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMealById(id: string | undefined) {
  return useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useRandomMeal() {
  return useQuery({
    queryKey: ["meal", "random"],
    queryFn: getRandomMeal,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMealsByCategory(category: string) {
  return useQuery({
    queryKey: ["meals", "category", category],
    queryFn: () => getMealsByCategory(category),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDBCategories() {
  return useQuery({
    queryKey: ["mealdb", "categories"],
    queryFn: getDBCategories,
    staleTime: 1000 * 60 * 60,
  });
}
