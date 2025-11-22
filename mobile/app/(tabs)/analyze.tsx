/**
 * Analyze Screen
 *
 * Job description analysis form.
 *
 * TODO Exercise 3: Add keyboard-avoiding behavior
 * @see https://reactnative.dev/docs/keyboardavoidingview
 */

import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSize, borderRadius, shadows } from "@/constants/theme";

export default function AnalyzeScreen() {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | { matchScore: number; suggestions: string[] }>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;

    setIsAnalyzing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setResult({
      matchScore: 78,
      suggestions: [
        "Add more React experience to your profile",
        "Highlight leadership skills",
        "Include metrics in your achievements",
      ],
    });

    setIsAnalyzing(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Input Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Job Description</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={8}
          placeholder="Paste the job description here..."
          placeholderTextColor={colors.neutral[400]}
          value={jobDescription}
          onChangeText={setJobDescription}
          textAlignVertical="top"
        />
      </View>

      {/* Analyze Button */}
      <Pressable
        style={[styles.button, !jobDescription.trim() && styles.buttonDisabled]}
        onPress={handleAnalyze}
        disabled={!jobDescription.trim() || isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons name="search-outline" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Analyze Job</Text>
          </>
        )}
      </Pressable>

      {/* Results */}
      {result && (
        <View style={styles.results}>
          {/* Match Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Match Score</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{result.matchScore}%</Text>
            </View>
            <Text style={styles.scoreDescription}>
              {result.matchScore >= 80 ? "Great match!" : result.matchScore >= 60 ? "Good match" : "Consider improving"}
            </Text>
          </View>

          {/* Suggestions */}
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>Suggestions</Text>
            {result.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Ionicons name="bulb-outline" size={16} color={colors.fjord[600]} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.neutral[900],
    minHeight: 200,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.fjord[600],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  buttonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: "600",
  },
  results: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  scoreCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  scoreLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.fjord[100],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.fjord[600],
  },
  scoreValue: {
    fontSize: fontSize["2xl"],
    fontWeight: "700",
    color: colors.fjord[600],
  },
  scoreDescription: {
    fontSize: fontSize.base,
    color: colors.neutral[600],
    marginTop: spacing.sm,
  },
  suggestionsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  suggestionsTitle: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
});
