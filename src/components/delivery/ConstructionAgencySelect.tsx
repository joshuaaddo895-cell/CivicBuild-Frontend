import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { listAgencies, getAgency } from '@api/agencies';
import type { ConstructionAgency } from '@appTypes/deliveryProvider';
import theme from '@theme/index';

interface ConstructionAgencySelectProps {
  selectedAgencyId: string | null;
  onSelect: (agencyId: string) => void;
  isLoading?: boolean;
}

function mapAgency(agency: {
  id: string;
  name: string;
  logoUrl?: string | null;
  verified: boolean;
}): ConstructionAgency {
  return {
    id: agency.id,
    name: agency.name,
    logoUri: agency.logoUrl ?? '',
    verified: agency.verified,
  };
}

export default function ConstructionAgencySelect({
  selectedAgencyId,
  onSelect,
  isLoading = false,
}: ConstructionAgencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [agencies, setAgencies] = useState<ConstructionAgency[]>([]);
  const [selectedAgencyCache, setSelectedAgencyCache] = useState<ConstructionAgency | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedAgency = useMemo(() => {
    if (!selectedAgencyId) {
      return null;
    }
    return (
      agencies.find((agency) => agency.id === selectedAgencyId) ??
      (selectedAgencyCache?.id === selectedAgencyId ? selectedAgencyCache : null)
    );
  }, [agencies, selectedAgencyCache, selectedAgencyId]);

  useEffect(() => {
    if (!selectedAgencyId) {
      setSelectedAgencyCache(null);
      return;
    }

    if (agencies.some((agency) => agency.id === selectedAgencyId)) {
      return;
    }

    void (async () => {
      const result = await getAgency(selectedAgencyId);
      if (result.ok) {
        setSelectedAgencyCache(mapAgency(result.data));
      }
    })();
  }, [agencies, selectedAgencyId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      void (async () => {
        setIsFetching(true);
        setFetchError(null);

        const result = await listAgencies(searchQuery.trim() || undefined, 0, 50);

        if (result.ok) {
          setAgencies(result.data.items.map(mapAgency));
        } else {
          setAgencies([]);
          setFetchError(result.error.message);
        }

        setIsFetching(false);
      })();
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [isOpen, searchQuery]);

  const handleSelect = (agency: ConstructionAgency) => {
    onSelect(agency.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Construction Company Association *</Text>
      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={isLoading}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        accessibilityRole="button"
        accessibilityLabel="Select construction company"
        accessibilityHint="Required. Choose the company you deliver for."
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : selectedAgency ? (
          <View style={styles.selectedRow}>
            {selectedAgency.logoUri ? (
              <Image
                source={{ uri: selectedAgency.logoUri }}
                style={styles.selectedLogo}
                contentFit="cover"
                accessibilityLabel={`${selectedAgency.name} logo`}
              />
            ) : (
              <View style={[styles.selectedLogo, styles.logoPlaceholder]}>
                <MaterialIcons name="business" size={18} color={theme.colors.onSurfaceVariant} />
              </View>
            )}
            <Text style={styles.selectedName} numberOfLines={1}>
              {selectedAgency.name}
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>Search and select a company</Text>
        )}
        <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.onSurfaceVariant} />
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
          accessibilityLabel="Close company picker"
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle} accessibilityRole="header">
            Select Construction Company
          </Text>
          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={20} color={theme.colors.onSurfaceVariant} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search companies..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              style={styles.searchInput}
              accessibilityLabel="Search construction companies"
              autoCorrect={false}
            />
          </View>

          {isFetching ? (
            <View style={styles.centeredState}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : fetchError ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="error-outline" size={40} color={theme.colors.error} />
              <Text style={styles.emptyTitle}>Could not load companies</Text>
              <Text style={styles.emptySubtitle}>{fetchError}</Text>
            </View>
          ) : agencies.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="business" size={40} color={theme.colors.outline} />
              <Text style={styles.emptyTitle}>No construction companies found yet</Text>
              <Text style={styles.emptySubtitle}>
                Verified agencies will appear here once they join the platform.
              </Text>
            </View>
          ) : (
            <FlatList
              data={agencies}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                >
                  {item.logoUri ? (
                    <Image
                      source={{ uri: item.logoUri }}
                      style={styles.optionLogo}
                      contentFit="cover"
                      accessibilityLabel={`${item.name} logo`}
                    />
                  ) : (
                    <View style={[styles.optionLogo, styles.logoPlaceholder]}>
                      <MaterialIcons
                        name="business"
                        size={20}
                        color={theme.colors.onSurfaceVariant}
                      />
                    </View>
                  )}
                  <View style={styles.optionContent}>
                    <Text style={styles.optionName}>{item.name}</Text>
                    {item.verified ? (
                      <View style={styles.verifiedRow}>
                        <MaterialIcons name="verified" size={14} color={theme.colors.primary} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    ) : null}
                  </View>
                  {selectedAgencyId === item.id ? (
                    <MaterialIcons name="check-circle" size={22} color={theme.colors.primary} />
                  ) : null}
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: theme.spacing.sm,
  },
  triggerPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  placeholder: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  selectedRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  selectedLogo: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
  },
  logoPlaceholder: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedName: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
    paddingBottom: theme.spacing.stackLg,
  },
  sheetTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLow,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    paddingVertical: theme.spacing.xs,
  },
  centeredState: {
    paddingVertical: theme.spacing.stackLg,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.stackLg,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  optionPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  optionLogo: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
  },
});
