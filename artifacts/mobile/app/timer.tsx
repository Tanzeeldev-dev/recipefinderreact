import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import * as Haptics from "expo-haptics";

export default function TimerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { minutes: initMinutes } = useLocalSearchParams<{ minutes?: string }>();

  const [totalSeconds, setTotalSeconds] = useState(
    Math.max(60, parseInt(initMinutes ?? "0") * 60)
  );
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [customMin, setCustomMin] = useState(String(Math.floor(totalSeconds / 60)));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setFinished(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleSetCustom = () => {
    const mins = Math.max(1, parseInt(customMin) || 1);
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setRunning(false);
    setFinished(false);
  };

  const handleStart = async () => {
    setFinished(false);
    setRunning(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setRemaining(totalSeconds);
    setFinished(false);
  };

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 1;
  const circumference = 220;
  const strokeDash = circumference * progress;

  const timeDisplay =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const PRESETS = [5, 10, 15, 20, 30, 45];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
        },
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={colors.foreground} />
      </Pressable>

      <Text style={[styles.title, { color: colors.foreground }]}>Cooking Timer</Text>

      <View style={styles.timerWrap}>
        <View style={[styles.timerRing, { borderColor: colors.muted }]}>
          <View
            style={[
              styles.timerProgress,
              {
                borderColor: finished ? "#5B21B6" : running ? colors.primary : colors.border,
              },
            ]}
          />
          <Text style={[styles.timeText, { color: finished ? "#5B21B6" : colors.foreground }]}>
            {finished ? "Done!" : timeDisplay}
          </Text>
          {running && (
            <Text style={[styles.timerLabel, { color: colors.mutedForeground }]}>remaining</Text>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.controlBtn,
            { backgroundColor: colors.muted, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="refresh" size={22} color={colors.foreground} />
        </Pressable>

        <Pressable
          onPress={running ? handlePause : handleStart}
          style={({ pressed }) => [
            styles.playBtn,
            { backgroundColor: finished ? "#5B21B6" : colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons
            name={running ? "pause" : finished ? "checkmark" : "play"}
            size={32}
            color="#fff"
          />
        </Pressable>

        <Pressable
          onPress={() => {
            setRunning(false);
            setRemaining(remaining + 60);
            setTotalSeconds(remaining + 60);
          }}
          style={({ pressed }) => [
            styles.controlBtn,
            { backgroundColor: colors.muted, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.plusOneText, { color: colors.foreground }]}>+1m</Text>
        </Pressable>
      </View>

      <View style={styles.presetSection}>
        <Text style={[styles.presetLabel, { color: colors.mutedForeground }]}>QUICK SET</Text>
        <View style={styles.presets}>
          {PRESETS.map((min) => (
            <Pressable
              key={min}
              onPress={() => {
                const secs = min * 60;
                setTotalSeconds(secs);
                setRemaining(secs);
                setRunning(false);
                setFinished(false);
                setCustomMin(String(min));
              }}
              style={({ pressed }) => [
                styles.presetBtn,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.presetText, { color: colors.foreground }]}>{min}m</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.customSection}>
        <Text style={[styles.presetLabel, { color: colors.mutedForeground }]}>CUSTOM</Text>
        <View style={styles.customRow}>
          <View style={[styles.customInput, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              style={[styles.customText, { color: colors.foreground }]}
              value={customMin}
              onChangeText={setCustomMin}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[styles.customUnit, { color: colors.mutedForeground }]}>min</Text>
          </View>
          <Pressable
            onPress={handleSetCustom}
            style={({ pressed }) => [
              styles.setBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.setBtnText}>Set</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, justifyContent: "center", marginBottom: 8 },
  title: { fontSize: 24, fontFamily: "Figtree_700Bold", marginBottom: 32, textAlign: "center" },
  timerWrap: { alignItems: "center", marginBottom: 32 },
  timerRing: { width: 200, height: 200, borderRadius: 100, borderWidth: 8, alignItems: "center", justifyContent: "center" },
  timerProgress: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 8 },
  timeText: { fontSize: 48, fontFamily: "Figtree_700Bold", textAlign: "center" },
  timerLabel: { fontSize: 12, fontFamily: "Figtree_400Regular" },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 36 },
  controlBtn: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  playBtn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  plusOneText: { fontSize: 14, fontFamily: "Figtree_700Bold" },
  presetSection: { gap: 10, marginBottom: 20 },
  presetLabel: { fontSize: 11, fontFamily: "Figtree_600SemiBold", letterSpacing: 0.8 },
  presets: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  presetBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  presetText: { fontSize: 14, fontFamily: "Figtree_600SemiBold" },
  customSection: { gap: 10 },
  customRow: { flexDirection: "row", gap: 10 },
  customInput: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  customText: { flex: 1, fontSize: 18, fontFamily: "Figtree_700Bold", padding: 0 },
  customUnit: { fontSize: 13, fontFamily: "Figtree_500Medium" },
  setBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  setBtnText: { color: "#fff", fontSize: 15, fontFamily: "Figtree_700Bold" },
});
