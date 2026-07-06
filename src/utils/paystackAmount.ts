/** Paystack expects GHS amounts in pesewas (smallest unit): multiply cedis by 100. */
export function cedisToPesewas(amountInCedis: number): number {
  return Math.round(amountInCedis * 100);
}

export function pesewasToCedis(amountInPesewas: number): number {
  return amountInPesewas / 100;
}

export function formatCedis(amount: number): string {
  const hasFraction = Math.abs(amount % 1) > 0;
  const formatted = amount.toLocaleString('en-GH', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `GH₵ ${formatted}`;
}

/** Format a catalog price for display on product cards and seed data. */
export function formatGhCedisPrice(amount: number): string {
  return formatCedis(amount);
}

/** Strip a leading "per " prefix from mock product units (e.g. "per bag" → "bag"). */
export function formatUnitSuffix(unit?: string | null): string | null {
  if (!unit?.trim()) {
    return null;
  }

  return unit.trim().replace(/^per\s+/i, '');
}

/** Format: "GH₵ 65 / bag" — falls back to price only when unit is missing. */
export function formatPriceWithUnit(price: number, unit?: string | null): string {
  const priceText = formatCedis(price);
  const unitSuffix = formatUnitSuffix(unit);

  if (!unitSuffix) {
    return priceText;
  }

  return `${priceText} / ${unitSuffix}`;
}

/** Format: "GH₵ 65 / bag × 3 = GH₵ 195" for cart and checkout line items. */
export function formatCartLinePricing(
  price: number,
  quantity: number,
  unit?: string | null,
): string {
  const unitPrice = formatPriceWithUnit(price, unit);

  if (quantity <= 1) {
    return unitPrice;
  }

  return `${unitPrice} × ${quantity} = ${formatCedis(price * quantity)}`;
}
