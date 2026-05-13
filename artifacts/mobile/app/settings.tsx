import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

type ThemePref = "light" | "dark" | "system";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { preference, setPreference } = useTheme();

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile({ name: name.trim(), bio: bio.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeOptions: { label: string; value: ThemePref; icon: string }[] = [
    { label: "Light", value: "light", icon: "sunny-outline" },
    { label: "Dark", value: "dark", icon: "moon-outline" },
    { label: "System", value: "system", icon: "phone-portrait-outline" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: 60 + (Platform.OS === "web" ? 34 : insets.bottom),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.navHeader}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          APPEARANCE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.optionLabel, { color: colors.foreground }]}>Theme</Text>
          <View style={styles.themeOptions}>
            {themeOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setPreference(opt.value)}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: preference === opt.value ? colors.primary : colors.muted,
                    borderColor: preference === opt.value ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={16}
                  color={preference === opt.value ? "#fff" : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.themeBtnText,
                    { color: preference === opt.value ? "#fff" : colors.foreground },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          PROFILE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Display Name</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Bio</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border, height: 80 }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.mutedForeground}
                multiline
              />
            </View>
          </View>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: saved ? "#4CAF50" : colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons
              name={saved ? "checkmark" : "save-outline"}
              size={18}
              color="#fff"
            />
            <Text style={styles.saveBtnText}>
              {saved ? "Saved!" : "Save Changes"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Version", value: "1.0.0" },
            { label: "Built with", value: "Expo + React Native" },
          ].map((item) => (
            <View key={item.label} style={[styles.aboutRow, { borderColor: colors.border }]}>
              <Text style={[styles.aboutLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.aboutValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  pageTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16 },
  optionLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  themeOptions: { flexDirection: "row", gap: 8 },
  themeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  themeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  field: { gap: 8 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputWrap: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, justifyContent: "center" },
  input: { fontSize: 15, fontFamily: "Inter_400Regular", padding: 0 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 12 },
  saveBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  aboutRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  aboutLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  aboutValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
