import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AgencyPostType } from '@appTypes/agency';
import type { AgencyPostFormScreenProps } from '@appTypes/navigation';
import { ProductImagePicker, ScreenHeader } from '@components/agency';
import { AuthInput, AuthPrimaryButton } from '@components/auth';
import { useAgencyPostsStore } from '@store/agencyPostsStore';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

const POST_TYPES: { id: AgencyPostType; label: string }[] = [
  { id: 'service', label: 'Service' },
  { id: 'material', label: 'Material' },
  { id: 'general', label: 'General Update' },
];

export default function AgencyPostFormScreen({ navigation, route }: AgencyPostFormScreenProps) {
  const { postId } = route.params;
  const managedAgencyId = useAuthStore((state) => state.managedAgencyId);
  const agencyId = managedAgencyId ?? 'buildstrong-ltd';

  const getPostsByAgencyId = useAgencyPostsStore((state) => state.getPostsByAgencyId);
  const addPost = useAgencyPostsStore((state) => state.addPost);
  const updatePost = useAgencyPostsStore((state) => state.updatePost);
  const seedIfNeeded = useAgencyPostsStore((state) => state.seedIfNeeded);

  const existingPost = useMemo(() => {
    seedIfNeeded();
    if (!postId) {
      return undefined;
    }
    return getPostsByAgencyId(agencyId).find((post) => post.id === postId);
  }, [agencyId, getPostsByAgencyId, postId, seedIfNeeded]);

  const [type, setType] = useState<AgencyPostType>(existingPost?.type ?? 'general');
  const [title, setTitle] = useState(existingPost?.title ?? '');
  const [description, setDescription] = useState(existingPost?.description ?? '');
  const [imageUri, setImageUri] = useState<string | null>(existingPost?.imageUri ?? null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError('');

    if (!title.trim()) {
      setError('Post title is required.');
      return;
    }

    if (!description.trim()) {
      setError('Post description is required.');
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        type,
        title: title.trim(),
        description: description.trim(),
        imageUri,
      };

      if (existingPost) {
        updatePost(existingPost.id, agencyId, input);
      } else {
        addPost(agencyId, input);
      }

      navigation.goBack();
    } catch {
      setError('Unable to save post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={existingPost ? 'Edit Post' : 'Create Post'}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.fieldLabel}>Post Type</Text>
          <View style={styles.chipRow}>
            {POST_TYPES.map((entry) => (
              <Pressable
                key={entry.id}
                onPress={() => setType(entry.id)}
                style={({ pressed }) => [
                  styles.chip,
                  type === entry.id && styles.chipActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={entry.label}
                accessibilityState={{ selected: type === entry.id }}
              >
                <Text style={[styles.chipText, type === entry.id && styles.chipTextActive]}>
                  {entry.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <AuthInput
            label="Title"
            placeholder="Post headline"
            value={title}
            onChangeText={setTitle}
          />

          <AuthInput
            label="Description"
            placeholder="What would you like customers to know?"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <ProductImagePicker imageUri={imageUri} onImageSelected={setImageUri} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AuthPrimaryButton
            label={existingPost ? 'Save Changes' : 'Post'}
            loading={isSaving}
            onPress={handleSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackMd,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  chipText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
  error: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
  },
  pressed: {
    opacity: 0.85,
  },
});
