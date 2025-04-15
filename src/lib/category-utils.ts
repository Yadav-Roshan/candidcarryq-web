// Map of irregular plural forms that need special handling
const CATEGORY_MAPPINGS: Record<string, string> = {
  // Singular to plural mappings
  'backpack': 'backpacks',
  'handbag': 'handbags',
  'wallet': 'wallets',
  'bagpack': 'backpacks', // Common misspelling
  'purse': 'purses',
  'tote': 'totes',
  'messenger': 'messenger', // No change needed
  'travel': 'travel', // No change needed 
  'accessory': 'accessories',
  // Add other special cases as needed
};

// Valid categories that we have pages for
export const VALID_CATEGORIES = [
  'backpacks',
  'handbags',
  'wallets',
  'travel',
  'accessories',
  'messenger',
  'totes',
  'purses'
];

/**
 * Normalizes a category string to ensure consistent format
 * @param category The category string to normalize
 * @returns Normalized category string
 */
export function normalizeCategory(category: string): string {
  if (!category) return '';
  
  // Trim and convert to lowercase
  const lowercased = category.trim().toLowerCase();
  
  // Check if this is a special case we need to map
  if (CATEGORY_MAPPINGS[lowercased]) {
    return CATEGORY_MAPPINGS[lowercased];
  }
  
  // Check if it's already in our valid categories list
  if (VALID_CATEGORIES.includes(lowercased)) {
    return lowercased;
  }
  
  // Simple pluralization logic for common cases
  // If it ends with 's', assume it's already plural
  if (lowercased.endsWith('s')) {
    return lowercased;
  }
  
  // Otherwise, add 's' to make it plural
  return `${lowercased}s`;
}
