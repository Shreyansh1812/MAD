/**
 * Recipe Browser Page
 * External API Integration Demo - Displays recipes from TheMealDB API
 * 
 * LEARNING OBJECTIVES DEMONSTRATED:
 * ✅ 1. Understand REST APIs - Uses external TheMealDB API
 * ✅ 2. Perform GET requests - fetch() calls in service layer
 * ✅ 3. Parse JSON responses - JSON parsing and data transformation
 * ✅ 4. Display data in cards/lists - Card-based recipe grid
 * ✅ 5. Loading states - Skeleton loaders while fetching
 * ✅ 6. Error handling - Error messages with retry button
 * 
 * PURPOSE: Help food stall owners discover popular recipes
 * for menu inspiration and new item ideas
 */

import { useState } from 'react';
import { ChefHat, Search, RefreshCw, Lightbulb, Leaf, MapPin, AlertCircle, Loader } from 'lucide-react';
import { useRecipeData } from '../hooks/useRecipeData';
import { Button } from '../components/Shared/Button';
import { EmptyState } from '../components/Shared/EmptyState';
import { Alert } from '../components/Shared/Alert';

export const RecipeBrowserPage = () => {
  // ============================================
  // HOOK USAGE
  // TEACHING POINT: Custom hook provides data + loading + error states
  // ============================================
  const {
    recipes,
    isLoading,
    error,
    hasData,
    isEmpty,
    recipeCount,
    selectedCategory,
    fetchRandomRecipes,
    searchRecipes,
    fetchRecipesByCategory,
    refresh,
  } = useRecipeData(true); // auto-fetch on mount

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  // Categories for filtering
  const categories = [
    'Vegetarian',
    'Chicken',
    'Seafood',
    'Pasta',
    'Dessert',
    'Breakfast',
  ];

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchRecipes(searchQuery);
    }
  };

  const handleCategoryClick = async (category) => {
    if (selectedCategory === category) {
      // If clicking same category, show random recipes
      await fetchRandomRecipes(10);
    } else {
      await fetchRecipesByCategory(category);
    }
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const toggleRecipeDetails = (recipeId) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  // ============================================
  // LOADING STATE
  // TEACHING POINT: Show skeleton/spinner while data is loading
  // ============================================
  const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gray-300 rounded-xl flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ============================================
  // ERROR STATE
  // TEACHING POINT: Show error message with retry option
  // ============================================
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <Alert
            type="error"
            title="Failed to Load Recipes"
            message={error}
            className="mb-4"
          />
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleRefresh}
          >
            <RefreshCw size={20} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN UI
  // TEACHING POINT: Display fetched data in card-based layout
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 pb-24">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-xl sticky top-0 z-50 border-b-4 border-orange-500">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-2xl shadow-lg">
                <ChefHat className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Recipe Browser</h1>
                <p className="text-sm text-gray-600 font-medium">Menu Inspiration</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                <strong>Demo Feature:</strong> Browse popular recipes from external API to discover new menu item ideas!
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes... (e.g., 'pasta', 'chicken')"
                className="w-full px-4 py-3 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-base"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-bold text-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Count */}
          {hasData && (
            <p className="text-sm text-gray-600 mt-3 font-medium">
              Showing {recipeCount} recipe{recipeCount !== 1 ? 's' : ''}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* LOADING STATE */}
        {isLoading && <LoadingSkeleton />}

        {/* EMPTY STATE */}
        {isEmpty && !isLoading && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <EmptyState
              icon={Search}
              title="No Recipes Found"
              description="Try a different search term or browse categories above"
            />
          </div>
        )}

        {/* DATA - RECIPE CARDS */}
        {hasData && !isLoading && (
          <div className="space-y-4 animate-fade-in">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-orange-300"
              >
                <div className="flex gap-4 p-4">
                  {/* Recipe Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    {recipe.thumbnail ? (
                      <img
                        src={recipe.thumbnail}
                        alt={recipe.name}
                        className="w-full h-full object-cover rounded-xl shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                        <ChefHat size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Recipe Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {recipe.name}
                      </h3>
                      {recipe.isVegetarian && (
                        <div className="flex-shrink-0 w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                        <ChefHat size={12} />
                        {recipe.category}
                      </span>
                      {recipe.area && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                          <MapPin size={12} />
                          {recipe.area}
                        </span>
                      )}
                    </div>

                    {/* Ingredients Count */}
                    <p className="text-sm text-gray-600">
                      {recipe.ingredients?.length || 0} ingredients
                    </p>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleRecipeDetails(recipe.id)}
                      className="mt-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      {expandedRecipe === recipe.id ? '▲ Hide Details' : '▼ View Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRecipe === recipe.id && (
                  <div className="border-t-2 border-gray-100 p-4 bg-gray-50 animate-fade-in">
                    {/* Ingredients */}
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Leaf size={16} className="text-green-600" />
                        Ingredients:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {recipe.ingredients?.slice(0, 8).map((ing, idx) => (
                          <div key={idx} className="text-sm text-gray-700">
                            • {ing.measure} {ing.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions Preview */}
                    {recipe.instructions && (
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Instructions:</h4>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                          {recipe.instructions.substring(0, 200)}...
                        </p>
                      </div>
                    )}

                    {/* YouTube Link */}
                    {recipe.youtubeLink && (
                      <a
                        href={recipe.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm font-bold text-red-600 hover:text-red-700"
                      >
                        📺 Watch Video Recipe →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        {hasData && (
          <div className="mt-8 text-center">
            <div className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white px-6 py-4">
              <p className="text-sm text-gray-600 font-medium">
                Data from <strong className="text-orange-600">TheMealDB API</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                External REST API Integration Demo
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
