import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const webInput = Platform.OS === "web" ? ({ outlineWidth: 0 } as any) : {};

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={colors.foreground} />
      </Pressable>

      {!sent ? (
        <View style={styles.content}>
          <Image
            source={{ uri: "https://i.postimg.cc/C5WKG7JN/i3.png" }}
            style={styles.chefImage}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: colors.foreground }]}>Verify Your Email</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Enter your email and we'll send you a reset link
          </Text>

          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }, webInput]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.resetBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.resetBtnText}>Send Reset Link</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.content}>
          <Image
            source={{ uri: "https://i.postimg.cc/C5WKG7JN/i3.png" }}
            style={styles.chefImage}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: colors.foreground }]}>Check your email</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We've sent a password reset link to{"\n"}
            <Text style={{ color: colors.primary, fontFamily: "Figtree_600SemiBold" }}>{email}</Text>
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.resetBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.resetBtnText}>Back to Login</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, justifyContent: "center", marginBottom: 32 },
  content: { alignItems: "center", gap: 16 },
  chefImage: { width: 180, height: 180, marginBottom: 8 },
  title: { fontSize: 24, fontFamily: "Figtree_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, fontFamily: "Figtree_400Regular", textAlign: "center", lineHeight: 22 },
  inputWrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Figtree_400Regular",
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  resetBtn: { width: "100%", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 8 },
  resetBtnText: { color: "#fff", fontSize: 16, fontFamily: "Figtree_700Bold" },
});
