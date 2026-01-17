/**
 * Validation utilities for menu items
 * Centralized validation logic following DRY principle
 */

const VALIDATION_RULES = {
  ITEM_NAME_MAX_LENGTH: 50,
  PRICE_MIN: 0,
  PRICE_MAX: 999999.99,
  PRICE_DECIMALS: 2,
};

/**
 * Validate menu item name
 * @param {string} name - Item name to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateItemName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Item name is required' };
  }

  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Item name cannot be empty' };
  }

  if (trimmed.length > VALIDATION_RULES.ITEM_NAME_MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Item name must not exceed ${VALIDATION_RULES.ITEM_NAME_MAX_LENGTH} characters` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate menu item price
 * @param {number|string} price - Price to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validatePrice = (price) => {
  if (price === '' || price === null || price === undefined) {
    return { valid: false, error: 'Price is required' };
  }

  const numPrice = parseFloat(price);

  if (isNaN(numPrice)) {
    return { valid: false, error: 'Price must be a valid number' };
  }

  if (numPrice < VALIDATION_RULES.PRICE_MIN) {
    return { valid: false, error: 'Price must be positive' };
  }

  if (numPrice > VALIDATION_RULES.PRICE_MAX) {
    return { valid: false, error: `Price must not exceed ${VALIDATION_RULES.PRICE_MAX}` };
  }

  // Check decimal places
  const decimalPlaces = (numPrice.toString().split('.')[1] || '').length;
  if (decimalPlaces > VALIDATION_RULES.PRICE_DECIMALS) {
    return { 
      valid: false, 
      error: `Price can have at most ${VALIDATION_RULES.PRICE_DECIMALS} decimal places` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate complete menu item
 * @param {Object} item - Menu item to validate
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export const validateMenuItem = (item) => {
  const nameValidation = validateItemName(item.name);
  const priceValidation = validatePrice(item.price);

  return {
    valid: nameValidation.valid && priceValidation.valid,
    errors: {
      name: nameValidation.error,
      price: priceValidation.error,
    },
  };
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) {
    return '0.00';
  }
  return numPrice.toFixed(VALIDATION_RULES.PRICE_DECIMALS);
};

/**
 * Generate unique ID for menu items
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
