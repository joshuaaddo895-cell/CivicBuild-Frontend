import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AgencyPostsScreenProps } from '@appTypes/navigation';
import { EmptyState, ScreenHeader } from '@components/agency';
import { AGENCY_POST_TYPE_LABELS } from '@constants/mockAgencyPosts';
import { useAgencyPostsStore } from '@store/agencyPostsStore';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

function formatPostDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AgencyPostsScreen({ navigation }: AgencyPostsScreenProps) {
  const managedAgencyId = useAuthStore((state) => state.managedAgencyId);
  const agencyId = managedAgencyId ?? 'buildstrong-ltd';

  const seedIfNeeded = useAgencyPostsStore((state) => state.seedIfNeeded);
  const posts = useAgencyPostsStore((state) => state.getPostsByAgencyId(agencyId));
  const deletePost = useAgencyPostsStore((state) => state.deletePost);

  useEffect(() => {
    seedIfNeeded();
  }, [seedIfNeeded]);

  const handleDelete = (postId: string, title: string) => {
    Alert.alert('Delete post', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePost(postId, agencyId),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Posts & Announcements"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <Pressable
            onPress={() => navigation.navigate('AgencyPostForm', {})}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Create post"
          >
            <MaterialIcons name="add" size={24} color={theme.colors.primary} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {posts.length === 0 ? (
          <EmptyState
            icon="campaign"
            title="No posts yet"
            message="Share service updates, material arrivals, or general news with customers on your agency profile."
            actionLabel="Create Post"
            onActionPress={() => navigation.navigate('AgencyPostForm', {})}
          />
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.typeTag}>
                  <Text style={styles.typeText}>{AGENCY_POST_TYPE_LABELS[post.type]}</Text>
                </View>
                <Text style={styles.date}>{formatPostDate(post.createdAt)}</Text>
              </View>
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.snippet} numberOfLines={3}>
                {post.description}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => navigation.navigate('AgencyPostForm', { postId: post.id })}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${post.title}`}
                >
                  <MaterialIcons name="edit" size={18} color={theme.colors.primary} />
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(post.id, post.title)}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${post.title}`}
                >
                  <MaterialIcons name="delete-outline" size={18} color={theme.colors.error} />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  typeText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    textTransform: 'uppercase',
  },
  date: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  snippet: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    lineHeight: theme.typography.lineHeight.bodySm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  deleteText: {
    color: theme.colors.error,
  },
  pressed: {
    opacity: 0.75,
  },
});
