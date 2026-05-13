import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        {
          width: width ?? "100%",
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

export function SkeletonRecipeCard({ variant = "compact" }: { variant?: "featured" | "compact" | "list" }) {
  const colors = useColors();

  if (variant === "featured") {
    return (
      <View
        style={[
          styles.featuredSkeleton,
          { backgroundColor: colors.muted },
        ]}
      />
    );
  }

  if (variant === "list") {
    return (
      <View style={[styles.listSkeleton, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SkeletonBlock height={100} width={100} borderRadius={0} />
        <View style={styles.listSkeletonInfo}>
          <SkeletonBlock height={10} width="40%" borderRadius={6} />
          <SkeletonBlock height={14} borderRadius={6} style={{ marginTop: 6 }} />
          <SkeletonBlock height={14} width="70%" borderRadius={6} style={{ marginTop: 4 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.compactSkeleton, { backgroundColor: colors.card }]}>
      <SkeletonBlock height={130} borderRadius={0} />
      <View style={styles.compactSkeletonInfo}>
        <SkeletonBlock height={13} borderRadius={6} />
        <SkeletonBlock height={13} width="60%" borderRadius={6} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featuredSkeleton: {
    width: 280,
    height: 220,
    borderRadius: 20,
    marginLeft: 8,
  },
  listSkeleton: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
  },
  listSkeletonInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    gap: 4,
  },
  compactSkeleton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    flex: 1,
  },
  compactSkeletonInfo: {
    padding: 10,
    gap: 4,
  },
});
