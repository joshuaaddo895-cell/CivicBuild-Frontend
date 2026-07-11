import React, { useEffect, useMemo, useState } from 'react';
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

import { getProfile, updateProfile, uploadAvatar } from '@api/users';
import type { EditProfileScreenProps } from '@appTypes/navigation';
import { AuthInput, AuthPrimaryButton } from '@components/auth';
import ResendSuccessToast from '@components/auth/ResendSuccessToast';
import ProfileAvatarEditor from '@components/profile/ProfileAvatarEditor';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';
import { isLocalImageUri } from '@utils/agencyPostMappers';
import { buildImageUploadFile, validateImageUpload } from '@utils/uploadValidation';
import { formatUserDisplayName } from '@utils/userDisplay';
import { getUserInitials } from '@utils/userInitials';

export default function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const initialFullName = useMemo(() => {
    if (!user) {
      return '';
    }
    return formatUserDisplayName(user);
  }, [user]);

  const displayPhotoUri = pendingPhotoUri ?? user?.avatar ?? null;
  const userInitials = getUserInitials(user, fullName || initialFullName);

  const hasChanges = useMemo(() => {
    const nameChanged = fullName.trim() !== initialFullName.trim();
    const photoChanged = pendingPhotoUri !== null && pendingPhotoUri !== user?.avatar;
    return nameChanged || photoChanged;
  }, [fullName, initialFullName, pendingPhotoUri, user?.avatar]);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      setErrorMessage('');

      const currentUser = useAuthStore.getState().user;
      const result = await getProfile();

      if (result.ok) {
        updateUser(result.data);
        setFullName(formatUserDisplayName(result.data));
        setEmail(result.data.email);
      } else if (currentUser) {
        setFullName(formatUserDisplayName(currentUser));
        setEmail(currentUser.email);
        setErrorMessage(result.error.message);
      }

      setIsLoading(false);
    })();
  }, [updateUser]);

  const handlePhotoSelected = async (uri: string) => {
    setPendingPhotoUri(uri);
  };

  const handleSave = async () => {
    if (!user || !fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const payload: { fullName: string; profilePictureUrl?: string } = {
        fullName: fullName.trim(),
      };

      if (pendingPhotoUri) {
        if (isLocalImageUri(pendingPhotoUri)) {
          const localFile = buildImageUploadFile({ uri: pendingPhotoUri }, 'avatar');
          const validationError = validateImageUpload(localFile);
          if (validationError) {
            setErrorMessage(validationError);
            setIsSaving(false);
            return;
          }

          const uploadResult = await uploadAvatar(localFile);

          if (!uploadResult.ok) {
            setErrorMessage(uploadResult.error.message);
            return;
          }

          payload.profilePictureUrl = uploadResult.data.profilePictureUrl;
        } else {
          payload.profilePictureUrl = pendingPhotoUri;
        }
      }

      const result = await updateProfile(payload, user);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        return;
      }

      updateUser(result.data);
      setPendingPhotoUri(null);
      setShowSuccessToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarSection}>
              <ProfileAvatarEditor
                initials={userInitials}
                imageUri={displayPhotoUri}
                saving={isSaving}
                onConfirmPhoto={handlePhotoSelected}
              />
            </View>

            <View style={styles.form}>
              <AuthInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />

              <AuthInput
                label="Email"
                icon="email"
                value={email}
                editable={false}
                autoCapitalize="none"
                style={styles.readOnlyInput}
              />
              <Text style={styles.readOnlyHint}>Email cannot be changed from the app.</Text>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <AuthPrimaryButton
                label="Save Changes"
                showArrow={false}
                loading={isSaving}
                disabled={!hasChanges || isSaving || !fullName.trim()}
                onPress={() => void handleSave()}
              />
            </View>

            <ResendSuccessToast
              message="Profile updated successfully."
              visible={showSuccessToast}
              onHide={() => setShowSuccessToast(false)}
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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.xs,
    minWidth: 48,
  },
  backLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 48,
  },
  pressed: {
    opacity: 0.75,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.stackLg,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.md,
  },
  form: {
    gap: theme.spacing.md,
  },
  readOnlyInput: {
    color: theme.colors.onSurfaceVariant,
  },
  readOnlyHint: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    marginTop: -theme.spacing.sm,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
