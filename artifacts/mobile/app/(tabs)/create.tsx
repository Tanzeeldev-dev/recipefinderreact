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
import { useRecipeMaker } from "@/context/RecipeMakerContext";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES } from "@/data/recipes";

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
const CUISINES = ["Italian", "Mexican", "Asian", "American", "Mediterranean", "Indian", "French", "Other"];

export default function CreateRecipeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { saveRecipe } = useRecipeMaker();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Dinner");
  const [cuisine, setCuisine] = useState("Other");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("4");
  const [calories, setCalories] = useState("");
  const [ingredients, setIngredients] = useState<string[]>(["", ""]);
  const [steps, setSteps] = useState<string[]>(["", ""]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Recipe title is required");
      return;
    }
    const cleanIngredients = ingredients.filter((i) => i.trim());
    const cleanSteps = steps.filter((s) => s.trim());
    if (cleanIngredients.length === 0) {
      setError("Add at least one ingredient");
      return;
    }
    if (cleanSteps.length === 0) {
      setError("Add at least one step");
      return;
    }
    setError(null);

    const totalTime = (parseInt(prepTime) || 0) + (parseInt(cookTime) || 0);
    const recipe = await saveRecipe({
      title: title.trim(),
      category,
      cuisineType: cuisine,
      image: imageUrl.trim() || `https://picsum.photos/seed/${title.replace(/\s/g, "")}/600/400`,
      description: description.trim(),
      difficulty,
      time: totalTime || 30,
      prepTime: parseInt(prepTime) || 0,
      servings: parseInt(servings) || 4,
      calories: parseInt(calories) || 0,
      rating: 0,
      ingredients: cleanIngredients,
      steps: cleanSteps,
      notes: notes.trim(),
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      router.push("/my-recipes");
    }, 1200);
  };

  const categories = CATEGORIES.filter((c) => c.id !== "all");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0),
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>New Recipe</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Share your culinary creation</Text>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: "#FFEBEE" }]}>
          <Ionicons name="alert-circle" size={16} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {success && (
        <View style={[styles.successBox, { backgroundColor: "#E8F5E9" }]}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.successText}>Recipe saved! Redirecting...</Text>
        </View>
      )}

      <SectionLabel label="Basic Info" colors={colors} />

      <Field label="Recipe Title *" colors={colors}>
        <TextInput
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Grandma's Lasagna"
          placeholderTextColor={colors.mutedForeground}
        />
      </Field>

      <Field label="Description" colors={colors}>
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your recipe..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
        />
      </Field>

      <Field label="Image URL (optional)" colors={colors}>
        <TextInput
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://..."
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
        />
      </Field>

      <SectionLabel label="Category" colors={colors} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setCategory(cat.name)}
            style={[
              styles.chip,
              {
                backgroundColor: category === cat.name ? colors.primary : colors.muted,
                borderColor: category === cat.name ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: category === cat.name ? "#fff" : colors.foreground }]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionLabel label="Difficulty" colors={colors} />
      <View style={styles.row}>
        {DIFFICULTIES.map((d) => (
          <Pressable
            key={d}
            onPress={() => setDifficulty(d)}
            style={[
              styles.diffChip,
              {
                backgroundColor: difficulty === d ? colors.primary : colors.muted,
                borderColor: difficulty === d ? colors.primary : colors.border,
                flex: 1,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: difficulty === d ? "#fff" : colors.foreground }]}>
              {d}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionLabel label="Time & Servings" colors={colors} />
      <View style={styles.row}>
        {[
          { label: "Prep (min)", value: prepTime, setter: setPrepTime },
          { label: "Cook (min)", value: cookTime, setter: setCookTime },
          { label: "Servings", value: servings, setter: setServings },
          { label: "Calories", value: calories, setter: setCalories },
        ].map((f) => (
          <View key={f.label} style={styles.miniField}>
            <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
            <TextInput
              style={[styles.miniInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
              value={f.value}
              onChangeText={f.setter}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        ))}
      </View>

      <SectionLabel label="Ingredients *" colors={colors} />
      {ingredients.map((ing, index) => (
        <View key={index} style={styles.listItemRow}>
          <View style={[styles.listItemWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <View style={[styles.listDot, { backgroundColor: colors.primary }]} />
            <TextInput
              style={[styles.listInput, { color: colors.foreground }]}
              value={ing}
              onChangeText={(val) => updateIngredient(index, val)}
              placeholder={`Ingredient ${index + 1}`}
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <Pressable onPress={() => removeIngredient(index)} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
      ))}
      <Pressable onPress={addIngredient} style={[styles.addBtn, { borderColor: colors.primary }]}>
        <Ionicons name="add" size={18} color={colors.primary} />
        <Text style={[styles.addBtnText, { color: colors.primary }]}>Add Ingredient</Text>
      </Pressable>

      <SectionLabel label="Steps *" colors={colors} />
      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumText}>{index + 1}</Text>
          </View>
          <View style={[styles.stepInputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              style={[styles.listInput, { color: colors.foreground }]}
              value={step}
              onChangeText={(val) => updateStep(index, val)}
              placeholder={`Step ${index + 1}`}
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
          </View>
          <Pressable onPress={() => removeStep(index)} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
      ))}
      <Pressable onPress={addStep} style={[styles.addBtn, { borderColor: colors.primary }]}>
        <Ionicons name="add" size={18} color={colors.primary} />
        <Text style={[styles.addBtnText, { color: colors.primary }]}>Add Step</Text>
      </Pressable>

      <SectionLabel label="Notes (optional)" colors={colors} />
      <TextInput
        style={[styles.input, styles.textArea, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any additional tips, variations, or notes..."
        placeholderTextColor={colors.mutedForeground}
        multiline
        numberOfLines={3}
      />

      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.saveBtnText}>Save Recipe</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
  );
}

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 10 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 8 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12 },
  errorText: { color: "#F44336", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  successBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12 },
  successText: { color: "#4CAF50", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginTop: 8 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  input: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  textArea: { height: 80, textAlignVertical: "top" },
  chipScroll: { flexGrow: 0, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  row: { flexDirection: "row", gap: 8 },
  diffChip: { paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  miniField: { flex: 1, gap: 4 },
  miniLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  miniInput: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, borderWidth: 1, fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  listItemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  listItemWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  listDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  listInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", padding: 0 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 6, flexShrink: 0 },
  stepNumText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  stepInputWrap: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", justifyContent: "center" },
  addBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16, marginTop: 12 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
