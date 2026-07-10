import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deleteAgencyProduct as deleteAgencyProductApi, getMyAgency } from '@api/agencies';
import { getProducts } from '@api/catalog';
import type { Product } from '@appTypes/marketplace';
import type { AgencyProductsScreenProps } from '@appTypes/navigation';
import { EmptyState, ScreenHeader } from '@components/agency';
import { ProductGrid } from '@components/dashboard';
import { useProductStore } from '@store/productStore';
import theme from '@theme/index';

export default function AgencyProductsScreen({ navigation }: AgencyProductsScreenProps) {
  const removeAgencyProduct = useProductStore((state) => state.removeAgencyProduct);
  const addAgencyProduct = useProductStore((state) => state.addAgencyProduct);
  const fetchCatalog = useProductStore((state) => state.fetchCatalog);

  const [agencyProducts, setAgencyProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    const agencyResult = await getMyAgency();
    if (!agencyResult.ok) {
      setAgencyProducts([]);
      setLoadError(agencyResult.error.message);
      setIsLoading(false);
      return;
    }

    const productsResult = await getProducts({ agencyId: agencyResult.data.id, limit: 100 });
    if (productsResult.ok) {
      setAgencyProducts(productsResult.data.items);
      for (const product of productsResult.data.items) {
        addAgencyProduct(product);
      }
    } else {
      setLoadError(productsResult.error.message);
      setAgencyProducts([]);
    }

    void fetchCatalog();
    setIsLoading(false);
  }, [addAgencyProduct, fetchCatalog]);

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
    }, [loadProducts]),
  );

  const handleDelete = (productId: string, productName: string) => {
    Alert.alert(
      'Delete product',
      `Remove "${productName}" from your listings? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const result = await deleteAgencyProductApi(productId);
              if (result.ok) {
                removeAgencyProduct(productId);
                setAgencyProducts((current) =>
                  current.filter((product) => product.id !== productId),
                );
                return;
              }
              Alert.alert('Delete failed', result.error.message);
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="My Products & Materials"
        onBackPress={() => navigation.goBack()}
        rightAction={
          <Pressable
            onPress={() => navigation.navigate('AgencyProductForm', {})}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Add product"
          >
            <MaterialIcons name="add" size={24} color={theme.colors.primary} />
          </Pressable>
        }
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            onPress={() => void loadProducts()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {agencyProducts.length === 0 ? (
            <EmptyState
              icon="inventory-2"
              title="You haven't listed any products yet"
              message="Add your first material listing so customers can find and order from you."
              actionLabel="Add Product"
              onActionPress={() => navigation.navigate('AgencyProductForm', {})}
            />
          ) : (
            <>
              <ProductGrid
                products={agencyProducts}
                onProductPress={(productId) =>
                  navigation.navigate('AgencyProductForm', { productId })
                }
              />
              <View style={styles.manageList}>
                {agencyProducts.map((product) => (
                  <View key={product.id} style={styles.manageRow}>
                    <View style={styles.manageInfo}>
                      <Text style={styles.manageName} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text style={styles.manageStock}>
                        {product.inStock ? 'In stock' : 'Out of stock'}
                        {product.stockQuantity != null ? ` · Qty ${product.stockQuantity}` : ''}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('AgencyProductForm', { productId: product.id })
                      }
                      style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${product.name}`}
                    >
                      <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(product.id, product.name)}
                      style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${product.name}`}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackMd,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageList: {
    gap: theme.spacing.sm,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  manageInfo: {
    flex: 1,
    gap: 2,
  },
  manageName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  manageStock: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  iconAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  retryText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
});
