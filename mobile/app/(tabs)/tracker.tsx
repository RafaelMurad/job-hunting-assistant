/**
 * Tracker Screen
 *
 * List of job applications with status filters.
 *
 * TODO Exercise 2: Implement swipe-to-delete
 * @see https://docs.swmansion.com/react-native-gesture-handler/
 */

import { View, Text, ScrollView, StyleSheet, Pressable, FlatList } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSize, borderRadius, shadows } from "@/constants/theme";
import { formatRelativeTime, getStatusColor } from "@job-hunter/shared/utils";

// Mock data
const MOCK_APPLICATIONS = [
  { id: "1", company: "Google", position: "Software Engineer", status: "interview", appliedAt: new Date("2024-01-15") },
  { id: "2", company: "Meta", position: "Frontend Developer", status: "screening", appliedAt: new Date("2024-01-18") },
  { id: "3", company: "Amazon", position: "Full Stack Engineer", status: "applied", appliedAt: new Date("2024-01-20") },
  { id: "4", company: "Apple", position: "iOS Developer", status: "offer", appliedAt: new Date("2024-01-10") },
  { id: "5", company: "Netflix", position: "Senior Engineer", status: "rejected", appliedAt: new Date("2024-01-05") },
];

const STATUSES = ["all", "applied", "screening", "interview", "offer", "rejected"];

export default function TrackerScreen() {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredApplications = selectedStatus === "all"
    ? MOCK_APPLICATIONS
    : MOCK_APPLICATIONS.filter((app) => app.status === selectedStatus);

  return (
    <View style={styles.container}>
      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {STATUSES.map((status) => (
          <Pressable
            key={status}
            onPress={() => setSelectedStatus(status)}
            style={[
              styles.filterChip,
              selectedStatus === status && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ApplicationCard application={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>No applications found</Text>
          </View>
        }
      />
    </View>
  );
}

interface ApplicationCardProps {
  application: {
    id: string;
    company: string;
    position: string;
    status: string;
    appliedAt: Date;
  };
}

function ApplicationCard({ application }: ApplicationCardProps) {
  const statusColors = getStatusColor(application.status);

  return (
    <Pressable style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.companyName}>{application.company}</Text>
          <Text style={styles.position}>{application.position}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {application.status}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Ionicons name="time-outline" size={14} color={colors.neutral[400]} />
        <Text style={styles.dateText}>
          {formatRelativeTime(application.appliedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  filterContainer: {
    maxHeight: 56,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  filterChipActive: {
    backgroundColor: colors.fjord[600],
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.neutral[600],
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.neutral[900],
  },
  position: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
});
