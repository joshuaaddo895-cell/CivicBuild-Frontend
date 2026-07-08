import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SettingsScreenProps } from '@appTypes/navigation';
import { ResendSuccessToast } from '@components/auth';
import DeleteAccountModal from '@components/settings/DeleteAccountModal';
import theme from '@theme/index';
import {
  confirmSignOut,
  consumeChangePasswordSuccessToastFlag,
  performDeleteAccount,
  performSignOut,
} from '@utils/session';

interface SettingsRowProps {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingsRow({ label, onPress, destructive = false }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showPasswordToast, setShowPasswordToast] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void consumeChangePasswordSuccessToastFlag().then((shouldShow) => {
        if (shouldShow) {
          setShowPasswordToast(true);
        }
      });
    }, []),
  );

  const handleLogout = () => {
    confirmSignOut(async () => {
      setIsSigningOut(true);
      try {
        await performSignOut();
      } finally {
        setIsSigningOut(false);
      }
    });
  };

  const handleDeleteAccountConfirm = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const result = await performDeleteAccount();

      if (!result.ok) {
        setDeleteError(result.message);
        if (result.sessionCleared) {
          setDeleteModalVisible(false);
        }
        return;
      }

      setDeleteModalVisible(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back to dashboard"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.screenTitle} accessibilityRole="header">
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ResendSuccessToast
          message="Password updated successfully."
          visible={showPasswordToast}
          onHide={() => setShowPasswordToast(false)}
        />

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionCard}>
          <SettingsRow
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <Pressable
            onPress={handleLogout}
            disabled={isSigningOut}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
          >
            {isSigningOut ? (
              <ActivityIndicator color={theme.colors.error} />
            ) : (
              <Text style={styles.rowLabel}>Log Out</Text>
            )}
          </Pressable>
          <SettingsRow
            label="Delete Account"
            onPress={() => {
              setDeleteError(null);
              setDeleteModalVisible(true);
            }}
            destructive
          />
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={deleteModalVisible}
        loading={isDeletingAccount}
        errorMessage={deleteError}
        onCancel={() => {
          if (!isDeletingAccount) {
            setDeleteModalVisible(false);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void handleDeleteAccountConfirm()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  headerSpacer: {
    width: 40,
  },
  backButton: {
    padding: theme.spacing.xs,
    width: 40,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackMd,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.stackLg,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
    minHeight: 52,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  rowLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
  },
  rowLabelDestructive: {
    color: theme.colors.error,
    fontWeight: '600',
  },
});
