import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const { width: W } = Dimensions.get("window");
const IMG_SIZE = Math.min(W * 0.55, 240);
const USE_NATIVE_DRIVER = Platform.OS !== "web";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const firstName = user?.name?.split(" ")[0] ?? "Chef";

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 55,
          friction: 7,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40),
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      {/* Chef image with bounce-in */}
      <Animated.View
        style={[
          styles.imageWrap,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={[styles.imageCircle, { backgroundColor: colors.secondary }]}>
          <Image
            source={{ uri: "https://i.postimg.cc/3NPwX19Z/i2.png" }}
            style={{ width: IMG_SIZE, height: IMG_SIZE }}
            contentFit="contain"
          />
        </View>
      </Animated.View>

      {/* Welcome text */}
      <Animated.View
        style={[
          styles.textBlock,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.emoji]}>🎉</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Welcome, {firstName}!
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your account is all set. Start exploring hundreds of handpicked recipes from around the world.
        </Text>
      </Animated.View>

      {/* CTA button */}
      <Animated.View style={[styles.btnWrap, { opacity: btnAnim }]}>
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.btnText}>Start Cooking 🍳</Text>
        </Pressable>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: btnAnim }]}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Made with <Text style={{ color: "#E53E3E" }}>❤️</Text> by Recipe Finder
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 28,
  },
  imageWrap: {
    alignItems: "center",
  },
  imageCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  textBlock: {
    alignItems: "center",
    gap: 10,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: "Figtree_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Figtree_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  btnWrap: {
    width: "100%",
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Figtree_700Bold",
    letterSpacing: 0.3,
  },
  footer: {
    position: "absolute",
    bottom: 32,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Figtree_400Regular",
    textAlign: "center",
  },
});
