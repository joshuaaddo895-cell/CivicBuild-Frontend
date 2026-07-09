import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AllSuppliersScreenProps } from '@appTypes/navigation';
import { DashboardSearchBar } from '@components/dashboard';
import SupplierCard from '@components/dashboard/SupplierCard';
import { isConstructionAgencyId } from '@constants/agencyProfiles';
import { filterSuppliersBySearch, TRUSTED_SUPPLIERS } from '@constants/marketplaceData';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';

export default function AllSuppliersScreen({ navigation }: AllSuppliersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);

  const filteredSuppliers = useMemo(
    () => filterSuppliersBySearch(TRUSTED_SUPPLIERS, searchQuery),
    [searchQuery],
  );

  const handleSupplierPress = (supplierId: string) => {
    if (isConstructionAgencyId(supplierId)) {
      navigation.navigate('AgencyDetail', { agencyId: supplierId });
      return;
    }

    navigation.navigate('SupplierDetail', { supplierId });
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
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>All Suppliers</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          {filteredSuppliers.length} trusted supplier{filteredSuppliers.length === 1 ? '' : 's'}{' '}
          {searchQuery.trim() ? 'found' : 'near Accra'}
        </Text>

        <DashboardSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search suppliers by name or category..."
        />

        {filteredSuppliers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={40} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No suppliers found</Text>
            <Text style={styles.emptyBody}>
              Try a different name or category, such as cement, steel, or roofing.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                layout="list"
                isFavorite={isSaved(supplier.id, 'supplier')}
                onFavoritePress={() => toggleSaved(supplier.id, 'supplier')}
                onPress={() => handleSupplierPress(supplier.id)}
              />
            ))}
          </View>
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
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 32,
  },
  pressed: {
    opacity: 0.75,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.stackLg,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  list: {
    gap: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.stackLg,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  emptyBody: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
