import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
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
import { useColors } from "@/hooks/useColors";

const SCREEN_H = Dimensions.get("window").height;
const IMG_SIZE = Math.min(Dimensions.get("window").width * 0.52, SCREEN_H * 0.26);
const webInput = Platform.OS === "web" ? ({ outlineWidth: 0 } as any) : {};

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);
    const err = await login(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: "https://i.postimg.cc/PJBqWyKy/i1.png" }}
            style={{ width: IMG_SIZE, height: IMG_SIZE, marginBottom: 16 }}
            contentFit="contain"
          />
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Sign in to your account
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: "#FFEBEE" }]}>
              <Ionicons name="alert-circle" size={16} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
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
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }, webInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginBtn,
              { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.loginBtnText}>
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <Pressable
            onPress={() => router.push("/(auth)/signup")}
            style={({ pressed }) => [
              styles.signupBtn,
              { borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.signupBtnText, { color: colors.foreground }]}>
              Create an account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontFamily: "Figtree_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: "Figtree_400Regular" },
  form: { gap: 16 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  errorText: { color: "#F44336", fontSize: 13, fontFamily: "Figtree_500Medium", flex: 1 },
  field: { gap: 6 },
  label: { fontSize: 14, fontFamily: "Figtree_600SemiBold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
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

  loginBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Figtree_700Bold" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontFamily: "Figtree_400Regular" },
  signupBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  signupBtnText: { fontSize: 16, fontFamily: "Figtree_600SemiBold" },
});
