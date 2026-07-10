import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  createAgencyPost,
  getMyAgencyPosts,
  updateAgencyPost,
  uploadAgencyProductImage,
} from '@api/agencies';
import type { AgencyPostType } from '@appTypes/agency';
import type { AgencyPostFormScreenProps } from '@appTypes/navigation';
import type { LocalUploadFile } from '@appTypes/verificationDocuments';
import { ProductImagePicker, ScreenHeader } from '@components/agency';
import { AuthInput, AuthPrimaryButton } from '@components/auth';
import { AGENCY_POST_TYPE_LABELS } from '@constants/agencyPostLabels';
import theme from '@theme/index';
import { isLocalImageUri, mapBackendAgencyPost } from '@utils/agencyPostMappers';

const POST_TYPES: { id: AgencyPostType; label: string }[] = [
  { id: 'service', label: AGENCY_POST_TYPE_LABELS.service },
  { id: 'material', label: AGENCY_POST_TYPE_LABELS.material },
  { id: 'general', label: AGENCY_POST_TYPE_LABELS.general },
];

export default function AgencyPostFormScreen({ navigation, route }: AgencyPostFormScreenProps) {
  const { postId } = route.params;
  const isEditing = Boolean(postId);

  const [type, setType] = useState<AgencyPostType>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!postId) {
      return;
    }

    void (async () => {
      setIsLoading(true);
      setError('');

      const result = await getMyAgencyPosts();
      if (!result.ok) {
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      const existingPost = result.data.map(mapBackendAgencyPost).find((post) => post.id === postId);
      if (!existingPost) {
        setError('Post not found.');
        setIsLoading(false);
        return;
      }

      setType(existingPost.type);
      setTitle(existingPost.title);
      setDescription(existingPost.description);
      setImageUri(existingPost.imageUri ?? null);
      setIsLoading(false);
    })();
  }, [postId]);

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
      let resolvedImageUrl = imageUri;

      if (isLocalImageUri(imageUri)) {
        const localFile: LocalUploadFile = {
          uri: imageUri!,
          name: `post-${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        };
        const uploadResult = await uploadAgencyProductImage(localFile);
        if (!uploadResult.ok) {
          setError(uploadResult.error.message);
          return;
        }
        resolvedImageUrl = uploadResult.data.imageUrl;
      }

      const payload = {
        type,
        title: title.trim(),
        description: description.trim(),
        imageUrl: resolvedImageUrl,
      };

      const result = isEditing
        ? await updateAgencyPost(postId!, payload)
        : await createAgencyPost(payload);

      if (!result.ok) {
        setError(result.error.message);
        return;
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
        title={isEditing ? 'Edit Post' : 'Create Post'}
        onBackPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
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
              label={isEditing ? 'Save Changes' : 'Post'}
              loading={isSaving}
              onPress={handleSave}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
