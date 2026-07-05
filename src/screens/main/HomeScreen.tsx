import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeScreenProps } from '@appTypes/navigation';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

export default function HomeScreen({ navigation: _navigation }: HomeScreenProps) {
  const user = useAuthStore((state) => state.user);

  const cards = [
    { emoji: '🗳️', title: 'Local Elections', subtitle: 'Upcoming votes in your area', count: 3 },
    { emoji: '🏗️', title: 'Projects', subtitle: 'Community initiatives', count: 12 },
    { emoji: '📋', title: 'Petitions', subtitle: 'Active campaigns', count: 7 },
    { emoji: '💬', title: 'Discussions', subtitle: 'Community conversations', count: 48 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good morning{user?.firstName ? `, ${user.firstName}` : ''}! 👋
            </Text>
            <Text style={styles.subtitle}>Here's what's happening in your community</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
        </View>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Engaged</Text>
          </View>
        </View>

        {/* Action Cards */}
        <Text style={styles.sectionTitle}>Your Community</Text>
        <View style={styles.cardGrid}>
          {cards.map((card) => (
            <TouchableOpacity key={card.title} style={styles.card} activeOpacity={0.8}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{card.count}</Text>
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface.DEFAULT },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: { fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[400],
  },
  statLabel: { fontSize: theme.typography.fontSize.xs, color: theme.colors.text.muted },
  statDivider: { width: 1, backgroundColor: theme.colors.border },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  cardEmoji: { fontSize: 32, marginBottom: theme.spacing.sm },
  cardBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.borderRadius.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  cardSubtitle: { fontSize: theme.typography.fontSize.xs, color: theme.colors.text.muted },
});
