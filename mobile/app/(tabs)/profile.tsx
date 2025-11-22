/**
 * Profile Screen
 *
 * User profile with skills and settings.
 *
 * TODO Exercise 4: Add image picker for profile photo
 * @see https://docs.expo.dev/versions/latest/sdk/imagepicker/
 */

import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSize, borderRadius, shadows } from "@/constants/theme";

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    location: "San Francisco, CA",
    skills: ["React", "TypeScript", "Node.js", "Python"],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={colors.neutral[400]} />
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <Pressable
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? "checkmark" : "pencil"}
            size={16}
            color={colors.fjord[600]}
          />
          <Text style={styles.editButtonText}>
            {isEditing ? "Save" : "Edit Profile"}
          </Text>
        </Pressable>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.infoCard}>
          <InfoRow
            icon="location-outline"
            label="Location"
            value={profile.location}
            isEditing={isEditing}
          />
          <View style={styles.divider} />
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={profile.email}
            isEditing={isEditing}
          />
        </View>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {profile.skills.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
              {isEditing && (
                <Pressable
                  onPress={() =>
                    setProfile((p) => ({
                      ...p,
                      skills: p.skills.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Ionicons name="close" size={14} color={colors.fjord[600]} />
                </Pressable>
              )}
            </View>
          ))}
          {isEditing && (
            <Pressable style={styles.addSkillButton}>
              <Ionicons name="add" size={16} color={colors.fjord[600]} />
              <Text style={styles.addSkillText}>Add Skill</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Interviews</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>21%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          <SettingsRow icon="notifications-outline" label="Notifications" />
          <View style={styles.divider} />
          <SettingsRow icon="moon-outline" label="Dark Mode" />
          <View style={styles.divider} />
          <SettingsRow icon="help-circle-outline" label="Help & Support" />
          <View style={styles.divider} />
          <SettingsRow icon="log-out-outline" label="Sign Out" danger />
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, isEditing }: { icon: any; label: string; value: string; isEditing: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.neutral[400]} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
          <TextInput style={styles.infoInput} value={value} />
        ) : (
          <Text style={styles.infoValue}>{value}</Text>
        )}
      </View>
    </View>
  );
}

function SettingsRow({ icon, label, danger }: { icon: any; label: string; danger?: boolean }) {
  return (
    <Pressable style={styles.settingsRow}>
      <Ionicons name={icon} size={20} color={danger ? colors.clay[600] : colors.neutral[600]} />
      <Text style={[styles.settingsLabel, danger && styles.settingsLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing.md },
  header: { alignItems: "center", marginBottom: spacing.lg },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.neutral[200],
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  name: { fontSize: fontSize.xl, fontWeight: "700", color: colors.neutral[900] },
  email: { fontSize: fontSize.sm, color: colors.neutral[500], marginTop: spacing.xs },
  editButton: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.fjord[50], borderRadius: borderRadius.full,
  },
  editButtonText: { fontSize: fontSize.sm, fontWeight: "500", color: colors.fjord[600] },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.base, fontWeight: "600", color: colors.neutral[900], marginBottom: spacing.sm },
  infoCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.neutral[200] },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: fontSize.xs, color: colors.neutral[500] },
  infoValue: { fontSize: fontSize.base, color: colors.neutral[900] },
  infoInput: { fontSize: fontSize.base, color: colors.neutral[900], borderBottomWidth: 1, borderBottomColor: colors.fjord[500] },
  divider: { height: 1, backgroundColor: colors.neutral[100], marginVertical: spacing.sm },
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  skillBadge: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    backgroundColor: colors.fjord[100], paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full,
  },
  skillText: { fontSize: fontSize.sm, color: colors.fjord[700], fontWeight: "500" },
  addSkillButton: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    borderWidth: 1, borderColor: colors.fjord[300], borderStyle: "dashed",
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full,
  },
  addSkillText: { fontSize: fontSize.sm, color: colors.fjord[600] },
  statsGrid: { flexDirection: "row", gap: spacing.sm },
  statItem: { flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.neutral[200] },
  statValue: { fontSize: fontSize.xl, fontWeight: "700", color: colors.fjord[600] },
  statLabel: { fontSize: fontSize.xs, color: colors.neutral[500], marginTop: spacing.xs },
  settingsCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.neutral[200] },
  settingsRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  settingsLabel: { flex: 1, fontSize: fontSize.base, color: colors.neutral[900] },
  settingsLabelDanger: { color: colors.clay[600] },
});
