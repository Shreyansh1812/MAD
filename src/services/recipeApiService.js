/**
 * Recipe API Service
 * Demonstrates REST API integration with GET requests
 * Uses TheMealDB API (free, no API key required)
 * 
 * LEARNING OBJECTIVES:
 * 1. Understand REST APIs and HTTP GET requests
 * 2. Use fetch() to make API calls
 * 3. Parse JSON responses
 * 4. Handle errors and timeouts
 * 5. Structure API service layer
 * 
 * USE CASE: Help food stall owners discover popular recipes
 * for menu inspiration and new item ideas
 */

/**
 * Base URL for TheMealDB API
 * Free API for food recipes, no authentication required
 * Docs: https://www.themealdb.com/api.php
 */
const RECIPE_API_BASE = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Recipe API Service Class
 * Encapsulates all recipe-related API calls
 */
class RecipeApiService {
  /**
   * Fetch random recipes for inspiration
   * 
   * @param {number} count - Number of random recipes to fetch
   * @returns {Promise<Array>} Array of random recipe objects
   * 
   * TEACHING POINT: This demonstrates a REST GET request
   * - URL construction
   * - fetch() for HTTP requests
   * - async/await for handling Promises
   * - JSON parsing with response.json()
   */
  async getRandomRecipes(count = 10) {
    try {
      console.log(`🍽️ [RecipeAPI] Fetching ${count} random recipes...`);

      // TheMealDB returns one random meal per request
      // So we make multiple calls in parallel for better UX
      const promises = Array(count).fill(null).map(() =>
        this._fetchSingleRandomRecipe()
      );

      // TEACHING POINT: Promise.all for parallel API calls
      const recipes = await Promise.all(promises);
      
      // Filter out any null results (failed requests)
      const validRecipes = recipes.filter(r => r !== null);
      
      console.log(`✅ [RecipeAPI] Fetched ${validRecipes.length} recipes successfully`);

      return validRecipes;
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error fetching random recipes:', error);
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }
  }

  /**
   * Fetch a single random recipe
   * 
   * @private
   * @returns {Promise<Object|null>} Recipe object or null if failed
   * 
   * TEACHING POINT: HTTP GET request implementation
   */
  async _fetchSingleRandomRecipe() {
    try {
      const url = `${RECIPE_API_BASE}/random.php`;

      // TEACHING POINT: fetch() API for HTTP requests
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // TEACHING POINT: Check HTTP status codes
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // TEACHING POINT: Parse JSON response
      const data = await response.json();
      
      // API returns meals array with single item
      if (!data.meals || data.meals.length === 0) {
        return null;
      }

      // TEACHING POINT: Transform API data to app format
      return this._transformRecipeData(data.meals[0]);
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error fetching single recipe:', error);
      return null; // Return null instead of throwing to continue with other recipes
    }
  }

  /**
   * Search recipes by name
   * 
   * @param {string} query - Search query (recipe name)
   * @returns {Promise<Array>} Array of matching recipes
   * 
   * TEACHING POINT: GET request with query parameters
   */
  async searchRecipes(query) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      // TEACHING POINT: URL construction with query parameters
      const url = `${RECIPE_API_BASE}/search.php?s=${encodeURIComponent(query.trim())}`;

      console.log('🔍 [RecipeAPI] Searching recipes:', url);

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ [RecipeAPI] Search results:', data.meals?.length || 0);

      // API returns null if no results found
      if (!data.meals) {
        return [];
      }

      // Transform all recipes
      return data.meals.map(meal => this._transformRecipeData(meal));
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error searching recipes:', error);
      throw new Error(`Failed to search recipes: ${error.message}`);
    }
  }

  /**
   * Get recipes by category
   * 
   * @param {string} category - Category name (e.g., "Vegetarian", "Dessert")
   * @returns {Promise<Array>} Array of recipes in category
   * 
   * TEACHING POINT: Another example of GET with parameters
   */
  async getRecipesByCategory(category) {
    try {
      const url = `${RECIPE_API_BASE}/filter.php?c=${encodeURIComponent(category)}`;

      console.log('📂 [RecipeAPI] Fetching category:', category);

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ [RecipeAPI] Found recipes:', data.meals?.length || 0);

      if (!data.meals) {
        return [];
      }

      // Note: Category filter returns limited data, fetch full details
      return data.meals.map(meal => ({
        id: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: category,
      }));
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error fetching category:', error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  }

  /**
   * Get recipe details by ID
   * 
   * @param {string} recipeId - Recipe ID
   * @returns {Promise<Object>} Full recipe details
   * 
   * TEACHING POINT: Fetching specific resource by ID
   */
  async getRecipeById(recipeId) {
    try {
      const url = `${RECIPE_API_BASE}/lookup.php?i=${recipeId}`;

      console.log('📖 [RecipeAPI] Fetching recipe details:', recipeId);

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.meals || data.meals.length === 0) {
        throw new Error('Recipe not found');
      }

      return this._transformRecipeData(data.meals[0]);
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error fetching recipe details:', error);
      throw new Error(`Failed to fetch recipe: ${error.message}`);
    }
  }

  /**
   * Get list of all categories
   * 
   * @returns {Promise<Array>} Array of category objects
   */
  async getCategories() {
    try {
      const url = `${RECIPE_API_BASE}/categories.php`;

      console.log('📋 [RecipeAPI] Fetching categories...');

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ [RecipeAPI] Categories loaded:', data.categories?.length || 0);

      return data.categories || [];
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  /**
   * Transform raw API data into app-friendly format
   * TEACHING POINT: Data parsing and transformation
   * 
   * @private
   * @param {Object} rawMeal - Raw meal data from API
   * @returns {Object} Transformed recipe data
   */
  _transformRecipeData(rawMeal) {
    // Extract ingredients and measurements
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = rawMeal[`strIngredient${i}`];
      const measure = rawMeal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure ? measure.trim() : '',
        });
      }
    }

    // Determine if dish is vegetarian/vegan based on ingredients
    const meatKeywords = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'meat', 'bacon', 'sausage', 'turkey'];
    const isVegetarian = !ingredients.some(ing => 
      meatKeywords.some(keyword => ing.name.toLowerCase().includes(keyword))
    );

    return {
      id: rawMeal.idMeal,
      name: rawMeal.strMeal,
      category: rawMeal.strCategory || 'Unknown',
      area: rawMeal.strArea || 'Unknown',
      instructions: rawMeal.strInstructions || '',
      thumbnail: rawMeal.strMealThumb,
      tags: rawMeal.strTags ? rawMeal.strTags.split(',').map(t => t.trim()) : [],
      ingredients: ingredients,
      youtubeLink: rawMeal.strYoutube || null,
      isVegetarian: isVegetarian,
      
      // Additional metadata
      source: rawMeal.strSource || null,
      dateModified: rawMeal.dateModified || null,
    };
  }

  /**
   * Get popular categories for menu inspiration
   * 
   * @returns {Array} Preset list of popular food categories
   */
  getPopularCategories() {
    return [
      'Vegetarian',
      'Chicken',
      'Seafood',
      'Pasta',
      'Dessert',
      'Starter',
      'Breakfast',
      'Side',
    ];
  }
}

// Export singleton instance
export default new RecipeApiService();
