import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasSeenOnboarding: boolean;
  markOnboardingSeen: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => null,
  signup: async () => null,
  logout: () => {},
  updateProfile: async () => {},
  hasSeenOnboarding: false,
  markOnboardingSeen: () => {},
});

const SESSION_KEY = "@auth_user";
const USERS_KEY = "@auth_users";
const ONBOARDING_KEY = "@has_seen_onboarding";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SESSION_KEY),
      AsyncStorage.getItem(ONBOARDING_KEY),
    ]).then(([session, onboarding]) => {
      if (session) setUser(JSON.parse(session));
      if (onboarding === "true") setHasSeenOnboarding(true);
      setIsLoading(false);
    });
  }, []);

  const getUsers = async (): Promise<Record<string, { user: User; password: string }>> => {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  };

  const login = async (email: string, password: string): Promise<string | null> => {
    const users = await getUsers();
    const entry = users[email.toLowerCase()];
    if (!entry) return "No account found with this email";
    if (entry.password !== password) return "Incorrect password";
    setUser(entry.user);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(entry.user));
    return null;
  };

  const signup = async (name: string, email: string, password: string): Promise<string | null> => {
    const users = await getUsers();
    const key = email.toLowerCase();
    if (users[key]) return "An account with this email already exists";
    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: key,
    };
    users[key] = { user: newUser, password };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(newUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return null;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    const users = await getUsers();
    if (users[user.email]) {
      users[user.email].user = updated;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  };

  const markOnboardingSeen = async () => {
    setHasSeenOnboarding(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, updateProfile, hasSeenOnboarding, markOnboardingSeen }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
