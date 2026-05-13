import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface RecentlyViewedContextType {
  recentIds: string[];
  addRecentlyViewed: (id: string) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>({
  recentIds: [],
  addRecentlyViewed: () => {},
});

const STORAGE_KEY = "@recently_viewed";
const MAX_ITEMS = 10;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setRecentIds(JSON.parse(data));
    });
  }, []);

  const addRecentlyViewed = async (id: string) => {
    const next = [id, ...recentIds.filter((r) => r !== id)].slice(0, MAX_ITEMS);
    setRecentIds(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentIds, addRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}
