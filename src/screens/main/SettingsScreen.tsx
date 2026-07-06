import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SettingsScreenProps } from '@appTypes/navigation';
import theme from '@theme/index';
import { confirmSignOut, performSignOut } from '@utils/session';

interface SettingsRowProps {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  trailing?: React.ReactNode;
}

function SettingsRow({ label, onPress, destructive = false, trailing }: SettingsRowProps) {
  const content = (
    <>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
      {trailing ?? (
        <MaterialIcons name="chevron-right" size={22} color={theme.colors.onSurfaceVariant} />
      )}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {content}
    </Pressable>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        <SettingsSection title="Account">
          <SettingsRow label="Change Password" onPress={() => {}} />
          <SettingsRow label="Change Email" onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            label="Push Notifications"
            trailing={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{
                  false: theme.colors.outlineVariant,
                  true: theme.colors.primaryContainer,
                }}
                thumbColor={
                  pushNotifications ? theme.colors.primary : theme.colors.surfaceContainerHigh
                }
                accessibilityLabel="Push notifications toggle"
              />
            }
          />
          <SettingsRow
            label="Email Notifications"
            trailing={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{
                  false: theme.colors.outlineVariant,
                  true: theme.colors.primaryContainer,
                }}
                thumbColor={
                  emailNotifications ? theme.colors.primary : theme.colors.surfaceContainerHigh
                }
                accessibilityLabel="Email notifications toggle"
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Privacy">
          <SettingsRow label="Privacy Policy" onPress={() => {}} />
          <SettingsRow label="Data & Permissions" onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="App Preferences">
          <SettingsRow label="Language" onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="Session">
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
          <SettingsRow label="Delete Account" onPress={() => {}} destructive />
        </SettingsSection>
      </ScrollView>
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
    gap: theme.spacing.stackMd,
    paddingBottom: theme.spacing.stackLg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.xs,
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
