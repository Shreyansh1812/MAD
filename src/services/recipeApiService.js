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

      // If no recipes fetched (network error), return mock data
      if (validRecipes.length === 0) {
        console.warn('⚠️ [RecipeAPI] No recipes fetched from API, using mock data');
        return this._getMockRecipes(count);
      }

      return validRecipes;
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error fetching random recipes:', error);
      console.warn('⚠️ [RecipeAPI] Falling back to mock data');
      return this._getMockRecipes(count);
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
      // Note: No headers needed for simple GET requests to avoid CORS preflight
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
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
      console.error('❌ [RecipeAPI] This might be due to network issues, CORS, or firewall');
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
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ [RecipeAPI] Search results:', data.meals?.length || 0);

      // API returns null if no results found
      if (!data.meals) {
        // Search mock data as fallback
        const mockRecipes = this._getMockRecipes(8);
        const filtered = mockRecipes.filter(r => 
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.category.toLowerCase().includes(query.toLowerCase()) ||
          r.area.toLowerCase().includes(query.toLowerCase())
        );
        console.log('⚠️ [RecipeAPI] Using filtered mock data:', filtered.length);
        return filtered;
      }

      // Transform all recipes
      return data.meals.map(meal => this._transformRecipeData(meal));
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error searching recipes:', error);
      console.warn('⚠️ [RecipeAPI] Falling back to filtered mock data');
      // Return filtered mock data as fallback
      const mockRecipes = this._getMockRecipes(8);
      return mockRecipes.filter(r => 
        r.name.toLowerCase().includes(query.toLowerCase())
      );
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

        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ [RecipeAPI] Found recipes:', data.meals?.length || 0);

      if (!data.meals) {
        // Return filtered mock data
        const mockRecipes = this._getMockRecipes(8);
        const filtered = mockRecipes.filter(r => 
          r.category.toLowerCase() === category.toLowerCase()
        );
        console.log('⚠️ [RecipeAPI] Using filtered mock data:', filtered.length);
        return filtered;
      }

      // TEACHING POINT: Category filter returns limited data (id, name, thumbnail only)
      // We need to fetch full details for each recipe to get ingredients
      // Limit to first 10 to avoid too many API calls
      const recipesToFetch = data.meals.slice(0, 10);
      console.log('📥 [RecipeAPI] Fetching full details for', recipesToFetch.length, 'recipes...');
      
      const fullRecipePromises = recipesToFetch.map(meal => 
        this.getRecipeById(meal.idMeal)
      );
      
      const fullRecipes = await Promise.all(fullRecipePromises);
      
      // Filter out any null results
      const validRecipes = fullRecipes.filter(r => r !== null);
      console.log('✅ [RecipeAPI] Loaded full details for', validRecipes.length, 'recipes');
      
      return validRecipes;
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error fetching category:', error);
      console.warn('⚠️ [RecipeAPI] Falling back to filtered mock data');
      // Return filtered mock data as fallback
      const mockRecipes = this._getMockRecipes(8);
      return mockRecipes.filter(r => 
        r.category.toLowerCase() === category.toLowerCase()
      );
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
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.meals || data.meals.length === 0) {
        console.warn('⚠️ [RecipeAPI] Recipe not found:', recipeId);
        return null;
      }

      return this._transformRecipeData(data.meals[0]);
      
    } catch (error) {
      console.error('❌ [RecipeAPI] Error fetching recipe details:', error);
      return null; // Return null instead of throwing to allow other recipes to load
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
    console.log('====== 🔍 TRANSFORM START ======');
    console.log('Raw meal:', rawMeal);
    console.log('Meal name:', rawMeal?.strMeal);
    console.log('All keys:', Object.keys(rawMeal || {}));
    
    // Debug: Log the raw meal data
    console.log('📋 [RecipeAPI] Sample ingredient fields:', {
      ing1: rawMeal.strIngredient1,
      ing2: rawMeal.strIngredient2,
      ing3: rawMeal.strIngredient3,
      measure1: rawMeal.strMeasure1,
      measure2: rawMeal.strMeasure2,
    });

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

    // Debug logging
    console.log('📋 [RecipeAPI] Extracted ingredients count:', ingredients.length);
    if (ingredients.length > 0) {
      console.log('📋 [RecipeAPI] Sample ingredients:', ingredients.slice(0, 3));
    } else {
      console.warn('⚠️ [RecipeAPI] No ingredients found! Check raw data:', Object.keys(rawMeal));
    }

    // Determine if dish is vegetarian/vegan based on ingredients
    const meatKeywords = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'meat', 'bacon', 'sausage', 'turkey'];
    const isVegetarian = !ingredients.some(ing => 
      meatKeywords.some(keyword => ing.name.toLowerCase().includes(keyword))
    );

    const transformed = {
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

    console.log('✅ [RecipeAPI] Transformed recipe:', transformed.name, '- Ingredients:', transformed.ingredients.length);
    console.log('Transformed object:', transformed);
    console.log('====== ✅ TRANSFORM END ======');

    return transformed;
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

  /**
   * Get mock recipe data (fallback when API is unavailable)
   * 
   * @private
   * @param {number} count - Number of mock recipes to return
   * @returns {Array} Array of mock recipe objects
   * 
   * TEACHING POINT: Fallback data for offline/error scenarios
   */
  _getMockRecipes(count = 10) {
    const mockRecipes = [
      {
        id: 'mock-1',
        name: 'Vegetable Biryani',
        category: 'Vegetarian',
        area: 'Indian',
        instructions: 'Heat oil in a large pot. Add cumin seeds and let them splutter. Add sliced onions and fry until golden. Add ginger-garlic paste and sauté. Add vegetables and spices, cook for 5 minutes. Layer with partially cooked basmati rice. Cover and cook on low heat for 20 minutes. Garnish with fried onions and fresh coriander.',
        thumbnail: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
        tags: ['Spicy', 'Rice', 'Healthy'],
        ingredients: [
          { name: 'Basmati Rice', measure: '2 cups' },
          { name: 'Mixed Vegetables', measure: '3 cups' },
          { name: 'Onions', measure: '2 large' },
          { name: 'Ginger-Garlic Paste', measure: '2 tbsp' },
          { name: 'Yogurt', measure: '1 cup' },
          { name: 'Biryani Masala', measure: '3 tbsp' },
          { name: 'Mint Leaves', measure: '1/4 cup' },
          { name: 'Coriander', measure: '1/4 cup' },
        ],
        youtubeLink: null,
        isVegetarian: true,
        source: null,
        dateModified: null,
      },
      {
        id: 'mock-2',
        name: 'Butter Chicken',
        category: 'Chicken',
        area: 'Indian',
        instructions: 'Marinate chicken pieces in yogurt, lemon juice, and spices for 2 hours. Grill or pan-fry until cooked. In a separate pan, heat butter and oil. Add onions, ginger-garlic paste. Cook tomato puree with spices. Add cream and kasuri methi. Add grilled chicken. Simmer for 10 minutes. Garnish with cream.',
        thumbnail: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300',
        tags: ['Curry', 'Creamy', 'Popular'],
        ingredients: [
          { name: 'Chicken', measure: '500g' },
          { name: 'Butter', measure: '100g' },
          { name: 'Tomato Puree', measure: '2 cups' },
          { name: 'Cream', measure: '1 cup' },
          { name: 'Yogurt', measure: '1/2 cup' },
          { name: 'Ginger-Garlic Paste', measure: '2 tbsp' },
          { name: 'Garam Masala', measure: '1 tbsp' },
          { name: 'Kasuri Methi', measure: '1 tsp' },
        ],
        youtubeLink: null,
        isVegetarian: false,
        source: null,
        dateModified: null,
      },
      {
        id: 'mock-3',
        name: 'Chilli Prawn Linguine',
        category: 'Seafood',
        area: 'Italian',
        instructions: 'Cook linguine according to package instructions. Heat olive oil in a large pan. Add garlic and red chilli flakes. Add prawns and cook for 2-3 minutes. Add cherry tomatoes and white wine. Toss in cooked linguine. Add parsley and lemon juice. Season with salt and pepper.',
        thumbnail: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300',
        tags: ['Pasta', 'Spicy', 'Quick'],
        ingredients: [
          { name: 'Linguine', measure: '400g' },
          { name: 'Prawns', measure: '500g' },
          { name: 'Garlic', measure: '6 cloves' },
          { name: 'Cherry Tomatoes', measure: '200g' },
          { name: 'Red Chilli', measure: '2 fresh' },
          { name: 'White Wine', measure: '1/2 cup' },
          { name: 'Olive Oil', measure: '3 tbsp' },
          { name: 'Parsley', measure: '1/4 cup' },
        ],
        youtubeLink: null,
        isVegetarian: false,
        source: null,
        dateModified: null,
      },
      {
        id: 'mock-4',
        name: 'Paneer Tikka Masala',
        category: 'Vegetarian',
        area: 'Indian',
        instructions: 'Cut paneer into cubes. Marinate in yogurt, spices, and lemon juice for 30 minutes. Thread onto skewers with bell peppers and onions. Grill until charred. For gravy: heat oil, add onion, ginger-garlic paste. Add tomato puree and spices. Add cream and kasuri methi. Add grilled paneer. Simmer for 5 minutes.',
        thumbnail: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
        tags: ['Vegetarian', 'Grilled', 'Curry'],
        ingredients: [
          { name: 'Paneer', measure: '400g' },
          { name: 'Bell Peppers', measure: '2 large' },
          { name: 'Onions', measure: '2 medium' },
          { name: 'Yogurt', measure: '1 cup' },
          { name: 'Cream', measure: '1/2 cup' },
          { name: 'Tomato Puree', measure: '1 cup' },
          { name: 'Tikka Masala', measure: '2 tbsp' },
          { name: 'Kasuri Methi', measure: '1 tsp' },
        ],
        youtubeLink: null,
        isVegetarian: true,
        source: null,
        dateModified: null,
      },
      {
        id: 'mock-5',
        name: 'Chicken Fried Rice',
        category: 'Chicken',
        area: 'Chinese',
        instructions: 'Cook rice and let cool completely (preferably day-old rice). Heat oil in wok. Scramble eggs and set aside. Stir-fry chicken until cooked. Add vegetables and stir-fry on high heat. Add rice and break up clumps. Add soy sauce, oyster sauce, and sesame oil. Add eggs back. Toss well. Garnish with spring onions.',
        thumbnail: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300',
        tags: ['Rice', 'Quick', 'Stir-fry'],
        ingredients: [
          { name: 'Cooked Rice', measure: '4 cups' },
          { name: 'Chicken Breast', measure: '300g' },
          { name: 'Eggs', measure: '2' },
          { name: 'Mixed Vegetables', measure: '2 cups' },
          { name: 'Soy Sauce', measure: '3 tbsp' },
          { name: 'Spring Onions', measure: '4 stalks' },
          { name: 'Garlic', measure: '4 cloves' },
          { name: 'Sesame Oil', measure: '1 tsp' },
        ],
        youtubeLink: null,
        isVegetarian: false,
        source: null,
        dateModified: null,
      },
      {
        id: 'mock-6',
        name: 'Margherita Pizza',
        category: 'Pasta',
        area: 'Italian',
        instructions: 'Preheat oven to 250°C. Roll out pizza dough on floured surface. Spread tomato sauce evenly. Top with sliced mozzarella cheese. Drizzle with olive oil. Bake for 10-12 minutes until crust is golden. Remove from oven. Top with fresh basil leaves. Drizzle with more olive oil. Season with salt.',
        thumbnail: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300',
        tags: ['Italian', 'Vegetarian', 'Classic'],
        ingredients: [
          { name: 'Pizza Dough', measure: '1 ball' },
          { name: 'Tomato Sauce', measure: '1/2 cup' },
          { name: 'Mozzarella', measure: '200g' },
          { name: 'Fresh Basil', measure: '10 leaves' },
          { name: 'Olive Oil', measure: '2 tbsp' },
          { name: 'Salt', measure: 'to taste' },
        ],
        youtubeLink: null,
        isVegetarian: true,
        source: null,
        dateModified: null,
      },
      {
        id: 'mock-7',
        name: 'Chicken Tacos',
        category: 'Chicken',
        area: 'Mexican',
        instructions: 'Season chicken with taco spices. Cook in hot pan until done. Shred with forks. Warm tortillas. Fill with chicken, lettuce, tomatoes, cheese, and sour cream. Add salsa and hot sauce. Garnish with coriander and lime.',
        thumbnail: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300',
        tags: ['Mexican', 'Quick', 'Street Food'],
        ingredients: [
          { name: 'Chicken Breast', measure: '400g' },
          { name: 'Tortillas', measure: '8 pieces' },
          { name: 'Lettuce', measure: '1 cup' },
          { name: 'Tomatoes', measure: '2 medium' },
          { name: 'Cheese', measure: '1 cup' },
          { name: 'Sour Cream', measure: '1/2 cup' },
          { name: 'Taco Seasoning', measure: '2 tbsp' },
          { name: 'Lime', measure: '2' },
        ],
        youtubeLink: null,
        isVegetarian: false,
        source: null,
        dateModified: null,
      },
      {
        id: 'mock-8',
        name: 'Dal Tadka',
        category: 'Vegetarian',
        area: 'Indian',
        instructions: 'Pressure cook dal with turmeric until soft. In a pan, heat ghee. Add cumin seeds, garlic, and green chillies. Add onions and tomatoes. Add spices and cook. Pour over cooked dal. Mix well. Simmer for 5 minutes. Garnish with coriander.',
        thumbnail: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300',
        tags: ['Lentils', 'Healthy', 'Comfort Food'],
        ingredients: [
          { name: 'Toor Dal', measure: '1 cup' },
          { name: 'Onions', measure: '2 medium' },
          { name: 'Tomatoes', measure: '2 medium' },
          { name: 'Garlic', measure: '6 cloves' },
          { name: 'Cumin Seeds', measure: '1 tsp' },
          { name: 'Ghee', measure: '2 tbsp' },
          { name: 'Red Chilli Powder', measure: '1 tsp' },
          { name: 'Coriander', measure: '2 tbsp' },
        ],
        youtubeLink: null,
        isVegetarian: true,
        source: null,
        dateModified: null,
      },
    ];

    // Return requested number of recipes (or all if count is larger)
    return mockRecipes.slice(0, Math.min(count, mockRecipes.length));
  }
}

// Export singleton instance
export default new RecipeApiService();
