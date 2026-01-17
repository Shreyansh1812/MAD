/**
 * Validation utilities for menu items
 * Centralized validation logic following DRY principle
 */

const VALIDATION_RULES = {
  ITEM_NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 100,
  PRICE_MIN: 0,
  PRICE_MAX: 999999.99,
  PRICE_DECIMALS: 2,
  STALL_NAME_MAX_LENGTH: 50,
  WAIT_TIME_MAX_LENGTH: 20,
};

export const CATEGORIES = [
  'Breakfast',
  'Main Course',
  'Appetizers',
  'Drinks',
  'Desserts',
  'Snacks',
  'Other',
];

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
  const descriptionValidation = validateDescription(item.description || '');
  const categoryValidation = validateCategory(item.category || 'Other');

  return {
    valid: nameValidation.valid && priceValidation.valid && descriptionValidation.valid && categoryValidation.valid,
    errors: {
      name: nameValidation.error,
      price: priceValidation.error,
      description: descriptionValidation.error,
      category: categoryValidation.error,
    },
  };
};

/**
 * Validate menu item description
 * @param {string} description - Item description to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateDescription = (description) => {
  if (!description) {
    return { valid: true, error: null }; // Optional field
  }

  if (typeof description !== 'string') {
    return { valid: false, error: 'Description must be a string' };
  }

  if (description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Description must not exceed ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate menu item category
 * @param {string} category - Category to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateCategory = (category) => {
  if (!category) {
    return { valid: true, error: null }; // Will default to 'Other'
  }

  if (!CATEGORIES.includes(category)) {
    return { 
      valid: false, 
      error: `Category must be one of: ${CATEGORIES.join(', ')}` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate stall name
 * @param {string} stallName - Stall name to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateStallName = (stallName) => {
  if (!stallName || typeof stallName !== 'string') {
    return { valid: false, error: 'Stall name is required' };
  }

  const trimmed = stallName.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Stall name cannot be empty' };
  }

  if (trimmed.length > VALIDATION_RULES.STALL_NAME_MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Stall name must not exceed ${VALIDATION_RULES.STALL_NAME_MAX_LENGTH} characters` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate wait time
 * @param {string} waitTime - Wait time to validate
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateWaitTime = (waitTime) => {
  if (!waitTime) {
    return { valid: true, error: null }; // Optional field
  }

  if (typeof waitTime !== 'string') {
    return { valid: false, error: 'Wait time must be a string' };
  }

  if (waitTime.length > VALIDATION_RULES.WAIT_TIME_MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Wait time must not exceed ${VALIDATION_RULES.WAIT_TIME_MAX_LENGTH} characters` 
    };
  }

  return { valid: true, error: null };
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
