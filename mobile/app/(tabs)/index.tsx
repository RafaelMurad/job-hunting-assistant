/**
 * Home Screen
 *
 * Dashboard with quick stats and recent activity.
 *
 * TODO Exercise 1: Add pull-to-refresh functionality
 * @see https://reactnative.dev/docs/refreshcontrol
 */

import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSize, borderRadius, shadows } from "@/constants/theme";

export default function HomeScreen() {
  // Mock data - replace with API call
  const stats = {
    totalApplications: 24,
    interviews: 5,
    pending: 12,
    offers: 2,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.subtitle}>Here's your job search overview</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Applications"
          value={stats.totalApplications}
          icon="document-text-outline"
          color={colors.fjord[600]}
          bgColor={colors.fjord[100]}
        />
        <StatCard
          label="Interviews"
          value={stats.interviews}
          icon="calendar-outline"
          color={colors.forest[600]}
          bgColor={colors.forest[100]}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon="time-outline"
          color={colors.neutral[600]}
          bgColor={colors.neutral[100]}
        />
        <StatCard
          label="Offers"
          value={stats.offers}
          icon="trophy-outline"
          color={colors.clay[600]}
          bgColor={colors.clay[100]}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Link href="/analyze" asChild>
            <Pressable style={styles.actionButton}>
              <Ionicons name="add-circle-outline" size={24} color={colors.fjord[600]} />
              <Text style={styles.actionText}>Analyze Job</Text>
            </Pressable>
          </Link>
          <Link href="/tracker" asChild>
            <Pressable style={styles.actionButton}>
              <Ionicons name="list-outline" size={24} color={colors.fjord[600]} />
              <Text style={styles.actionText}>View Tracker</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Recent Activity Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={colors.neutral[300]} />
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>Start tracking your applications!</Text>
        </View>
      </View>
    </ScrollView>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
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
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize["2xl"],
    fontWeight: "700",
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "48%",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.sm,
  },
  statValue: {
    fontSize: fontSize["2xl"],
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  actionText: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.fjord[600],
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  emptyText: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
});
