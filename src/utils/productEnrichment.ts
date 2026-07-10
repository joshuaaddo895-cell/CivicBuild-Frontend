import type { Product } from '@appTypes/marketplace';
import { formatUnitSuffix } from '@utils/paystackAmount';

const BRAND_PREFIXES = [
  'GHACEM',
  'Dangote',
  'Sol Cement',
  'Sol',
  'Cimaf',
  'Diamond',
  'Supaacem',
  'Coral',
  'Leyland',
  'Azartex',
  'Azar',
  'AluWorks',
  'Somotex',
  'Heritage Clay',
  'PaveWay',
  'Quarry Direct',
  'Tema Steel',
  'IronMan',
  'Apex',
  'Accra Cement',
  'West Africa Cement',
  'BuildStrong',
  'Finishing Touch',
  'EcoBlock',
  'Specialty Concrete',
];

function extractBrand(name: string, supplierName?: string): string | undefined {
  for (const prefix of BRAND_PREFIXES) {
    if (name.toLowerCase().startsWith(prefix.toLowerCase())) {
      return prefix;
    }
  }

  return supplierName;
}

function extractSize(name: string): string | undefined {
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch) {
    return parenMatch[1];
  }

  const kgMatch = name.match(/\b(\d+\s?kg)\b/i);
  if (kgMatch) {
    return kgMatch[1];
  }

  const dimMatch = name.match(/\b(\d+x\d+(?:cm|mm|m)?)\b/i);
  if (dimMatch) {
    return dimMatch[1];
  }

  return undefined;
}

function extractSpec(category: string, name: string): string | undefined {
  switch (category) {
    case 'cement': {
      const grade = name.match(/\b(32\.5\w?|42\.5\w?)\b/i);
      return grade ? `${grade[1]} Grade` : 'General purpose';
    }
    case 'blocks': {
      const inch = name.match(/\b(\d+-inch|\d+-inch)\b/i);
      return inch ? `${inch[1]} block` : 'Standard block';
    }
    case 'gravel':
      return name.includes('Sand') ? 'Washed aggregate' : 'Crushed aggregate';
    case 'steel': {
      const mm = name.match(/\b(\d+mm)\b/i);
      return mm ? `${mm[1]} rebar` : 'Structural steel';
    }
    case 'roofing': {
      const gauge = name.match(/\b(0\.\d+mm)\b/i);
      return gauge ? `${gauge[1]} gauge` : 'Weather-resistant';
    }
    case 'tiles':
      return name.includes('Porcelain') ? 'Porcelain finish' : 'Ceramic finish';
    case 'paint':
      return name.includes('Exterior')
        ? 'Exterior grade'
        : name.includes('Enamel')
          ? 'Gloss enamel'
          : 'Interior/exterior';
    case 'plumbing':
      return name.includes('PVC') ? 'PVC fitting' : 'Plumbing fixture';
    case 'electrical':
      return name.includes('Cable') ? 'Copper cable' : 'Electrical fitting';
    default:
      return undefined;
  }
}

function buildHighlight(product: Product): string {
  const size = extractSize(product.name);
  const sizeText = size ? ` (${size})` : '';

  switch (product.category) {
    case 'cement':
      return `High-quality cement${sizeText} for structural work, plastering, and general construction.`;
    case 'blocks':
      return `Durable concrete blocks${sizeText} for walls, partitions, and site works.`;
    case 'gravel':
      return `Reliable aggregate supply${sizeText} for concrete mixes, foundations, and road base.`;
    case 'steel':
      return `Reinforcement steel${sizeText} for beams, columns, slabs, and structural frames.`;
    case 'roofing':
      return `Roofing material${sizeText} suited for residential and commercial projects.`;
    case 'tiles':
      return `Finishing tiles${sizeText} for floors, walls, and wet areas.`;
    case 'paint':
      return `Quality paint${sizeText} for interior and exterior finishing.`;
    case 'plumbing':
      return `Plumbing supply${sizeText} for water distribution and drainage systems.`;
    case 'electrical':
      return `Electrical material${sizeText} for wiring, fittings, and installations.`;
    default:
      return `Construction material${sizeText} for your building project.`;
  }
}

function buildDescription(product: Product, brand?: string): string {
  const brandText = brand ? `${brand} ` : '';
  const unitSuffix = formatUnitSuffix(product.unit) ?? 'unit';

  return `${brandText}${product.name} is a trusted ${product.category} product supplied for Ghanaian construction projects. It is commonly used by contractors and homeowners for reliable results on site. Sold ${product.unit ?? `per ${unitSuffix}`}, this listing is curated for the CivicBuild marketplace and ready for pickup or delivery coordination with the supplier.`;
}

export function enrichProduct(product: Product): Product {
  const supplierName = product.supplierName ?? product.supplier_name;
  const brand = extractBrand(product.name, supplierName);
  const inStock = product.inStock ?? product.in_stock ?? true;

  return {
    ...product,
    supplierName,
    brand,
    size: extractSize(product.name),
    spec: extractSpec(product.category, product.name),
    highlight: buildHighlight(product),
    description: product.description || buildDescription(product, brand),
    deliveryEstimate: inStock ? '2-3 days' : '5-7 days',
    inStock,
  };
}

export function usesNumericQuantityInput(unit?: string): boolean {
  const suffix = formatUnitSuffix(unit)?.toLowerCase();
  return suffix === 'ton' || suffix === 'm²' || suffix === 'm2';
}
