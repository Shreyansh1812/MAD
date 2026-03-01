/**
 * Custom Hook: useRecipeData
 * Manages recipe data fetching with loading and error states
 * 
 * LEARNING OBJECTIVES:
 * 1. Implement custom React hooks for data fetching
 * 2. Manage loading, error, and success states
 * 3. Handle asynchronous operations
 * 4. Implement data refresh functionality
 * 5. Clean up effects to prevent memory leaks
 * 
 * PURPOSE: Fetch recipe data from external API to inspire
 * food stall owners with new menu item ideas
 */

import { useState, useEffect, useCallback } from 'react';
import recipeApiService from '../services/recipeApiService';

/**
 * Custom hook for fetching recipe data from external API
 * 
 * TEACHING POINT: This hook demonstrates the complete lifecycle of API data fetching:
 * - Initial loading state (shows spinner/skeleton)
 * - Error handling (shows error message)
 * - Success state with data (shows content)
 * - Manual refresh capability
 * - Cleanup on unmount
 * 
 * @param {boolean} autoFetch - Whether to fetch data automatically on mount
 * @returns {Object} - Recipe data, loading state, error, and control functions
 */
export const useRecipeData = (autoFetch = true) => {
  // ============================================
  // STATE MANAGEMENT
  // TEACHING POINT: Managing multiple states for API calls
  // This is a standard pattern for async operations
  // ============================================
  
  /**
   * Data state - stores the fetched recipe data
   * Initially null, becomes array of recipes on success
   */
  const [recipes, setRecipes] = useState([]);
  
  /**
   * Loading state - true while API call is in progress
   * Used to show loading spinners/skeletons
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Error state - stores error message if API call fails
   * null when no error, string message when error occurs
   */
  const [error, setError] = useState(null);
  
  /**
   * Last updated timestamp - tracks when data was last fetched
   * Useful for showing "Last updated: X minutes ago"
   */
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Selected category filter
   */
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ============================================
  // FETCH RANDOM RECIPES
  // TEACHING POINT: Async data fetching with complete error handling
  // ============================================
  const fetchRandomRecipes = useCallback(async (count = 10) => {
    try {
      // STEP 1: Set loading state BEFORE API call
      // This triggers UI to show loading indicator
      setIsLoading(true);
      setError(null);

      console.log(`🍽️ [useRecipeData] Fetching ${count} random recipes...`);

      // STEP 2: Call the API service
      // await pauses execution until Promise resolves
      const data = await recipeApiService.getRandomRecipes(count);

      // STEP 3: Update state with successful data
      // This triggers UI re-render with actual content
      setRecipes(data);
      setLastUpdated(new Date());
      setSelectedCategory(null);
      
      console.log(`✅ [useRecipeData] Loaded ${data.length} recipes successfully`);

      return { success: true, data };
      
    } catch (err) {
      // STEP 4: Handle errors gracefully
      // This triggers UI to show error message
      console.error('❌ [useRecipeData] Error fetching recipes:', err);
      setError(err.message || 'Failed to fetch recipes');
      setRecipes([]);
      
      return { success: false, error: err.message };
      
    } finally {
      // STEP 5: Always set loading to false when done
      // finally block runs regardless of success/failure
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // SEARCH RECIPES
  // TEACHING POINT: Search functionality with error handling
  // ============================================
  const searchRecipes = useCallback(async (query) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 [useRecipeData] Searching for:', query);

      const data = await recipeApiService.searchRecipes(query);
      
      setRecipes(data);
      setLastUpdated(new Date());
      setSelectedCategory(null);
      
      console.log(`✅ [useRecipeData] Found ${data.length} recipes`);

      return { success: true, data };
      
    } catch (err) {
      console.error('❌ [useRecipeData] Search error:', err);
      setError(err.message || 'Failed to search recipes');
      setRecipes([]);
      
      return { success: false, error: err.message };
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // FETCH RECIPES BY CATEGORY
  // TEACHING POINT: Filtered data fetching
  // ============================================
  const fetchRecipesByCategory = useCallback(async (category) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📂 [useRecipeData] Fetching category:', category);

      const data = await recipeApiService.getRecipesByCategory(category);
      
      setRecipes(data);
      setLastUpdated(new Date());
      setSelectedCategory(category);
      
      console.log(`✅ [useRecipeData] Loaded ${data.length} ${category} recipes`);

      return { success: true, data };
      
    } catch (err) {
      console.error('❌ [useRecipeData] Category fetch error:', err);
      setError(err.message || 'Failed to fetch category');
      setRecipes([]);
      
      return { success: false, error: err.message };
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // GET RECIPE DETAILS
  // TEACHING POINT: Fetching individual resource
  // ============================================
  const getRecipeDetails = useCallback(async (recipeId) => {
    try {
      console.log('📖 [useRecipeData] Fetching recipe details:', recipeId);

      const recipe = await recipeApiService.getRecipeById(recipeId);
      
      console.log('✅ [useRecipeData] Recipe details loaded');

      return { success: true, data: recipe };
      
    } catch (err) {
      console.error('❌ [useRecipeData] Details fetch error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ============================================
  // REFRESH DATA
  // TEACHING POINT: Manual data refresh functionality
  // Useful for "Pull to refresh" or "Retry" buttons
  // ============================================
  const refresh = useCallback(async () => {
    console.log('🔄 [useRecipeData] Refreshing recipe data...');
    
    if (selectedCategory) {
      // If we're viewing a category, refresh that category
      return await fetchRecipesByCategory(selectedCategory);
    } else {
      // Otherwise, fetch random recipes again
      return await fetchRandomRecipes(10);
    }
  }, [selectedCategory, fetchRecipesByCategory, fetchRandomRecipes]);

  // ============================================
  // CLEAR DATA
  // TEACHING POINT: Reset state utility
  // ============================================
  const clearData = useCallback(() => {
    console.log('🗑️ [useRecipeData] Clearing recipe data');
    setRecipes([]);
    setError(null);
    setLastUpdated(null);
    setSelectedCategory(null);
  }, []);

  // ============================================
  // AUTO-FETCH ON MOUNT
  // TEACHING POINT: useEffect for side effects and data fetching
  // This runs once when component mounts (similar to componentDidMount)
  // ============================================
  useEffect(() => {
    if (autoFetch) {
      console.log('🚀 [useRecipeData] Auto-fetching recipes on mount');
      fetchRandomRecipes(10);
    }

    // Cleanup function (runs on unmount)
    // TEACHING POINT: Always clean up to prevent memory leaks
    return () => {
      console.log('🧹 [useRecipeData] Cleaning up...');
      // Clear any pending requests or timers here if needed
    };
  }, [autoFetch, fetchRandomRecipes]);

  // ============================================
  // RETURN API
  // TEACHING POINT: Custom hook returns data and control functions
  // Components can destructure what they need
  // ============================================
  return {
    // Data
    recipes,
    isLoading,
    error,
    lastUpdated,
    selectedCategory,
    
    // Computed state
    hasData: recipes.length > 0,
    isEmpty: recipes.length === 0 && !isLoading && !error,
    recipeCount: recipes.length,
    
    // Actions
    fetchRandomRecipes,
    searchRecipes,
    fetchRecipesByCategory,
    getRecipeDetails,
    refresh,
    clearData,
  };
};

/**
 * ARCHITECTURE NOTES:
 * 
 * 1. CUSTOM HOOKS IN REACT:
 *    - Reusable stateful logic
 *    - Can use other hooks (useState, useEffect, useCallback)
 *    - Must start with "use" prefix
 *    - Can be shared across multiple components
 * 
 * 2. STATE MANAGEMENT PATTERN:
 *    Loading State → Shows spinner/skeleton while fetching
 *    Error State   → Shows error message if request fails
 *    Data State    → Shows actual data when successful
 *    
 *    This is the STANDARD PATTERN for async operations in React!
 * 
 * 3. SIMILAR CONCEPTS IN OTHER FRAMEWORKS:
 *    Android: Repository pattern + LiveData/StateFlow in ViewModel
 *            - Loading: LiveData<Boolean>
 *            - Error: LiveData<String?>
 *            - Data: LiveData<List<Recipe>>
 *    
 *    Flutter: FutureBuilder or StreamBuilder with AsyncSnapshot
 *            - ConnectionState.waiting → loading
 *            - snapshot.hasError → error
 *            - snapshot.hasData → data
 * 
 * 4. BEST PRACTICES IMPLEMENTED:
 *    ✅ Always handle loading state (UX feedback)
 *    ✅ Always handle error state (graceful degradation)
 *    ✅ Use try-catch-finally for proper cleanup
 *    ✅ Provide loading indicators to users
 *    ✅ Use useCallback to prevent unnecessary re-renders
 *    ✅ Clean up effects on unmount
 *    ✅ Return both data and control functions
 *    ✅ Log operations for debugging
 * 
 * 5. USAGE EXAMPLE:
 *    ```jsx
 *    function RecipePage() {
 *      const { recipes, isLoading, error, refresh } = useRecipeData(true);
 *      
 *      if (isLoading) return <LoadingSpinner />;
 *      if (error) return <ErrorMessage error={error} onRetry={refresh} />;
 *      return <RecipeList recipes={recipes} />;
 *    }
 *    ```
 */
