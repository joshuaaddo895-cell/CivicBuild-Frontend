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

import {
  createAgencyProduct,
  updateAgencyProduct as updateAgencyProductApi,
  uploadAgencyProductImage,
} from '@api/agencies';
import { mapBackendProduct } from '@api/catalog';
import type { AgencyProductFormScreenProps } from '@appTypes/navigation';
import type { LocalUploadFile } from '@appTypes/verificationDocuments';
import { ProductImagePicker, ScreenHeader } from '@components/agency';
import { AuthInput, AuthPrimaryButton } from '@components/auth';
import { PRODUCT_FORM_CATEGORIES, PRODUCT_FORM_UNITS } from '@constants/productFormOptions';
import { useAuthStore } from '@store/authStore';
import { useProductStore } from '@store/productStore';
import theme from '@theme/index';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';

export default function AgencyProductFormScreen({
  navigation,
  route,
}: AgencyProductFormScreenProps) {
  const { productId } = route.params;
  const managedAgencyId = useAuthStore((state) => state.managedAgencyId);
  const agencyId = managedAgencyId ?? '';

  const getProductsByAgencyId = useProductStore((state) => state.getProductsByAgencyId);
  const addAgencyProduct = useProductStore((state) => state.addAgencyProduct);
  const updateAgencyProduct = useProductStore((state) => state.updateAgencyProduct);
  const fetchCatalog = useProductStore((state) => state.fetchCatalog);

  const existingProduct = useMemo(() => {
    if (!productId) {
      return undefined;
    }
    return getProductsByAgencyId(agencyId).find((product) => product.id === productId);
  }, [agencyId, getProductsByAgencyId, productId]);

  const [name, setName] = useState(existingProduct?.name ?? '');
  const [category, setCategory] = useState(existingProduct?.category ?? PRODUCT_FORM_CATEGORIES[0]);
  const [price, setPrice] = useState(existingProduct ? String(existingProduct.price) : '');
  const [unit, setUnit] = useState(
    existingProduct?.unit?.replace(/^per\s+/i, '') ?? PRODUCT_FORM_UNITS[0],
  );
  const [stockQuantity, setStockQuantity] = useState(
    existingProduct?.stockQuantity != null ? String(existingProduct.stockQuantity) : '10',
  );
  const [imageUri, setImageUri] = useState(existingProduct?.imageUri ?? DEFAULT_IMAGE);
  const [description, setDescription] = useState(existingProduct?.description ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError('');

    const parsedPrice = Number(price);
    const parsedStock = Number(stockQuantity);

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Enter a valid price.');
      return;
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setError('Enter a valid stock quantity.');
      return;
    }

    setIsSaving(true);

    try {
      let resolvedImageUrl = imageUri;

      if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        const localFile: LocalUploadFile = {
          uri: imageUri,
          name: `product-${Date.now()}.jpg`,
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
        name: name.trim(),
        category,
        price: parsedPrice,
        unit,
        stockQuantity: parsedStock,
        imageUrl: resolvedImageUrl,
        description: description.trim() || `${name.trim()} — listed by your agency on CivicBuild.`,
      };

      if (existingProduct) {
        const result = await updateAgencyProductApi(existingProduct.id, payload);
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        updateAgencyProduct(mapBackendProduct(result.data));
      } else {
        const result = await createAgencyProduct(payload);
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        addAgencyProduct(mapBackendProduct(result.data));
      }

      await fetchCatalog();
      navigation.goBack();
    } catch {
      setError('Unable to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={existingProduct ? 'Edit Product' : 'Add Product'}
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
          <ProductImagePicker imageUri={imageUri} onImageSelected={setImageUri} />

          <AuthInput
            label="Product Name"
            placeholder="e.g. Dangote Cement 42.5N (50kg)"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipRow}>
            {PRODUCT_FORM_CATEGORIES.map((entry) => (
              <Pressable
                key={entry}
                onPress={() => setCategory(entry)}
                style={({ pressed }) => [
                  styles.chip,
                  category === entry && styles.chipActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Category ${entry}`}
                accessibilityState={{ selected: category === entry }}
              >
                <Text style={[styles.chipText, category === entry && styles.chipTextActive]}>
                  {entry}
                </Text>
              </Pressable>
            ))}
          </View>

          <AuthInput
            label="Price (GH₵)"
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <Text style={styles.fieldLabel}>Unit</Text>
          <View style={styles.chipRow}>
            {PRODUCT_FORM_UNITS.map((entry) => (
              <Pressable
                key={entry}
                onPress={() => setUnit(entry)}
                style={({ pressed }) => [
                  styles.chip,
                  unit === entry && styles.chipActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Unit ${entry}`}
                accessibilityState={{ selected: unit === entry }}
              >
                <Text style={[styles.chipText, unit === entry && styles.chipTextActive]}>
                  {entry}
                </Text>
              </Pressable>
            ))}
          </View>

          <AuthInput
            label="Stock Quantity"
            placeholder="0"
            value={stockQuantity}
            onChangeText={setStockQuantity}
            keyboardType="number-pad"
          />

          <AuthInput
            label="Short Description"
            placeholder="Brief product description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AuthPrimaryButton label="Save" loading={isSaving} onPress={handleSave} />
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
    textTransform: 'capitalize',
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
