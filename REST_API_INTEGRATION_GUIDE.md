# REST API Integration - Recipe Browser Feature

## ✅ Implementation Complete

Successfully integrated **external REST API** into QuickMenu mobile application to demonstrate all required learning objectives.

---

## 📚 Learning Objectives Achieved

### ✅ 1. Understand REST APIs
- **What**: Integrated TheMealDB API (https://www.themealdb.com/api.php)
- **How**: Service layer that communicates with external REST endpoints
- **Location**: `src/services/recipeApiService.js`

### ✅ 2. Perform GET Requests
- **What**: HTTP GET requests using JavaScript `fetch()` API
- **How**: Multiple GET endpoints for random recipes, search, and categories
- **Example**:
  ```javascript
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  ```
- **Location**: `src/services/recipeApiService.js` - methods like `getRandomRecipes()`, `searchRecipes()`, etc.

### ✅ 3. Parse JSON Responses
- **What**: Parse JSON data from API responses
- **How**: Using `response.json()` and data transformation
- **Example**:
  ```javascript
  const data = await response.json();
  return this._transformRecipeData(data.meals[0]);
  ```
- **Location**: `src/services/recipeApiService.js` - `_transformRecipeData()` method

### ✅ 4. Display API Data in Lists/Cards
- **What**: Card-based grid layout showing recipe data
- **How**: React components with responsive design
- **Features**:
  - Recipe cards with images, names, categories
  - Expandable details (ingredients, instructions)
  - Vegetarian indicators
  - Category and region tags
- **Location**: `src/pages/RecipeBrowserPage.jsx`

### ✅ 5. Implement Loading States
- **What**: Loading spinners and skeleton screens
- **How**: `isLoading` state management with visual feedback
- **Features**:
  - Skeleton cards while fetching data
  - Spinning refresh button
  - Loading animation
- **Location**: `src/pages/RecipeBrowserPage.jsx` - `LoadingSkeleton` component

### ✅ 6. Implement Error Handling
- **What**: Error messages with retry functionality
- **How**: Try-catch blocks with error state management
- **Features**:
  - Error alert boxes
  - Retry buttons
  - Graceful error messages
  - HTTP status code checking
- **Location**: `src/hooks/useRecipeData.js` and `src/pages/RecipeBrowserPage.jsx`

---

## 📁 Files Created

### 1. **Recipe API Service** (`src/services/recipeApiService.js`)
**Purpose**: Handles all REST API communication

**Key Methods**:
- `getRandomRecipes(count)` - Fetch random recipes for inspiration
- `searchRecipes(query)` - Search recipes by name
- `getRecipesByCategory(category)` - Filter by food category
- `getRecipeById(id)` - Get full recipe details
- `_transformRecipeData(rawMeal)` - Parse and transform API responses

**Teaching Points**:
- REST API URL construction
- Query parameters
- HTTP GET requests with fetch()
- JSON parsing
- Error handling
- Data transformation

### 2. **Custom Hook** (`src/hooks/useRecipeData.js`)
**Purpose**: Manages recipe data fetching with state management

**Features**:
- Loading state management
- Error state management
- Success state with data
- Refresh functionality
- Auto-fetch on mount
- Cleanup on unmount

**State Management**:
```javascript
const {
  recipes,        // Array of recipe data
  isLoading,      // Boolean - shows loading UI
  error,          // String - error message
  hasData,        // Boolean - computed state
  fetchRandomRecipes,   // Function to fetch data
  refresh,        // Function to refresh
} = useRecipeData(true);
```

**Teaching Points**:
- Custom React hooks
- useState for state management
- useEffect for side effects
- useCallback for memoization
- Async/await error handling
- Loading/Error/Success pattern

### 3. **Recipe Browser Page** (`src/pages/RecipeBrowserPage.jsx`)
**Purpose**: User interface displaying recipe data

**Features**:
- **Header**: Title, info banner, refresh button
- **Search Bar**: Search recipes by name
- **Category Filters**: Quick filter buttons
- **Recipe Cards**: 
  - Recipe image thumbnails
  - Name, category, region tags
  - Vegetarian indicator
  - Ingredient count
  - Expandable details section
- **Loading State**: Skeleton cards animation
- **Error State**: Error message with retry button
- **Empty State**: "No recipes found" message

**Teaching Points**:
- Component composition
- Conditional rendering
- Event handling
- State management integration
- Responsive design
- Card-based layouts

---

## 🔗 Navigation Integration

### Bottom Navigation
Added new tab in bottom navigation bar:

**Location**: `src/components/Navigation/BottomNavigation.jsx`

**New Item**:
```javascript
{
  id: 'recipes',
  label: 'Recipes',
  icon: ChefHat,
  path: '/dashboard/recipes',
  color: 'text-orange-500',
}
```

### Route Configuration
Added route to main app routing:

**Location**: `src/App.jsx`

**New Route**:
```javascript
<Route path="recipes" element={<RecipeBrowserPage />} />
```

---

## 🧪 How to Test

### 1. Start Development Server
```powershell
npm run dev
```
Server running at: http://localhost:3000/

### 2. Login to Application
1. Open browser to http://localhost:3000/
2. Login with your credentials (or register new account)

### 3. Navigate to Recipe Browser
- Click on **"Recipes"** tab in bottom navigation (🧑‍🍳 Chef hat icon)
- You'll be redirected to `/dashboard/recipes`

### 4. Test Features

#### Loading State Test
- Observe skeleton cards while data is fetching
- Loading animation on first page load

#### Data Display Test
- View 10 random recipes displayed as cards
- Each card shows:
  - Recipe thumbnail image
  - Recipe name
  - Category badge (e.g., "Chicken", "Vegetarian")
  - Region badge (e.g., "Indian", "Italian")
  - Ingredient count
  - Vegetarian indicator (green dot)

#### Search Functionality
1. Type "chicken" in search bar
2. Click "Search" button
3. View filtered results
4. Observe loading state during search

#### Category Filter
1. Click "Vegetarian" category button
2. View vegetarian recipes only
3. Click same button again to show random recipes

#### Expand Recipe Details
1. Click "▼ View Details" on any recipe card
2. See ingredients list
3. See instructions preview
4. See YouTube video link (if available)
5. Click "▲ Hide Details" to collapse

#### Refresh Test
1. Click refresh button (🔄) in header
2. Observe new random recipes loaded
3. Notice spinning animation during refresh

#### Error Handling Test
To test error handling (optional):
1. Disconnect internet
2. Click refresh button
3. See error message displayed
4. Click "Retry" button to try again

---

## 🎯 Use Case in QuickMenu Context

**Feature**: "Menu Inspiration for Stall Owners"

**Problem Solved**: Food stall owners often struggle to come up with new menu items or need inspiration for special dishes.

**Solution**: Browse popular recipes from around the world to:
- Discover trending dishes
- Get ingredient ideas
- Plan seasonal menus
- Expand menu variety
- Learn about different cuisines

**User Flow**:
1. Stall owner logs into QuickMenu
2. Clicks "Recipes" tab
3. Browses random recipe suggestions
4. Searches for specific items (e.g., "pasta", "dessert")
5. Views ingredients and instructions
6. Gets inspired to add similar items to their menu
7. Goes back to "Editor" tab to add new menu items

---

## 📊 API Details

### TheMealDB API
- **Base URL**: `https://www.themealdb.com/api/json/v1/1`
- **Authentication**: None required (free tier)
- **Rate Limiting**: None for free tier
- **Documentation**: https://www.themealdb.com/api.php

### Endpoints Used

| Endpoint | Method | Purpose | Example |
|----------|--------|---------|---------|
| `/random.php` | GET | Get random recipe | Returns 1 random recipe |
| `/search.php?s={query}` | GET | Search by name | Search for "chicken" |
| `/filter.php?c={category}` | GET | Filter by category | Get all "Vegetarian" |
| `/lookup.php?i={id}` | GET | Get by ID | Get recipe #52772 |
| `/categories.php` | GET | List categories | All food categories |

### Example Response
```json
{
  "meals": [
    {
      "idMeal": "52772",
      "strMeal": "Teriyaki Chicken Casserole",
      "strCategory": "Chicken",
      "strArea": "Japanese",
      "strInstructions": "Preheat oven to 350°...",
      "strMealThumb": "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
      "strIngredient1": "soy sauce",
      "strMeasure1": "3/4 cup"
    }
  ]
}
```

---

## 🏗️ Architecture Pattern

### Service Layer Pattern
```
UI Layer (RecipeBrowserPage.jsx)
         ↓
Custom Hook (useRecipeData.js)
         ↓
Service Layer (recipeApiService.js)
         ↓
External API (TheMealDB)
```

### State Management Flow
```
1. Component mounts
2. Hook auto-fetches data (useEffect)
3. Sets isLoading = true
4. Calls service method
5. Service makes fetch() request
6. Parses JSON response
7. Transforms data
8. Hook updates state
9. Component re-renders with data
10. Sets isLoading = false
```

### Error Flow
```
1. fetch() throws error (network/404/500)
2. catch block catches error
3. Sets error state with message
4. Component renders error UI
5. User clicks retry button
6. Repeats from step 1
```

---

## 💡 Key Concepts Demonstrated

### 1. **Separation of Concerns**
- **Service Layer**: Handles API logic
- **Custom Hook**: Manages state
- **Component**: Handles UI

### 2. **Async/Await Pattern**
```javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

### 3. **Loading/Error/Success Pattern**
- **Loading**: Show skeleton/spinner
- **Error**: Show error message + retry
- **Success**: Show actual data

### 4. **Data Transformation**
- Raw API data → App-friendly format
- Extracting nested data
- Computing derived fields

### 5. **React Hooks**
- `useState` - State management
- `useEffect` - Side effects (data fetching)
- `useCallback` - Memoization
- Custom hooks - Reusable logic

---

## 🎨 UI/UX Features

### Loading States
- ✅ Skeleton cards with pulse animation
- ✅ Spinning refresh button
- ✅ Disabled buttons during loading

### Error Handling
- ✅ Alert boxes with error messages
- ✅ Retry buttons
- ✅ HTTP status code checking

### Responsive Design
- ✅ Mobile-first design
- ✅ Card-based layout
- ✅ Scrollable category pills
- ✅ Safe area support for iOS

### Interactions
- ✅ Expandable recipe details
- ✅ Search functionality
- ✅ Category filtering
- ✅ Refresh capability
- ✅ External YouTube links

---

## 📝 Code Quality

### Best Practices Implemented
✅ **Comments**: Educational comments throughout code  
✅ **Error Handling**: Try-catch blocks everywhere  
✅ **Validation**: Input validation before API calls  
✅ **Logging**: Console logs for debugging  
✅ **TypeScript-ready**: JSDoc comments for type hints  
✅ **DRY Principle**: Reusable service methods  
✅ **Single Responsibility**: Each file has one purpose  
✅ **Clean Code**: Readable variable names  

---

## 🚀 Deployment Considerations

### CORS
- TheMealDB API has CORS enabled
- No proxy needed for development

### Production
- API calls work from any domain
- No API key required
- No rate limiting concerns

### Performance
- Images are lazy-loaded
- Data is fetched on demand
- Parallel API calls with Promise.all()

---

## 📖 Learning Resources

### React Hooks
- Official Docs: https://react.dev/reference/react/hooks
- Custom Hooks: https://react.dev/learn/reusing-logic-with-custom-hooks

### Fetch API
- MDN Docs: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Using Fetch: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

### REST APIs
- REST API Tutorial: https://restfulapi.net/
- HTTP Methods: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods

---

## ✅ Verification Checklist

Use this checklist to verify all learning objectives:

- [ ] **Understand REST APIs**: Read `recipeApiService.js` comments
- [ ] **GET Requests**: See fetch() calls in service methods
- [ ] **JSON Parsing**: Check `_transformRecipeData()` method
- [ ] **Display in Cards**: Open Recipe Browser page in browser
- [ ] **Loading State**: Observe skeleton cards on page load
- [ ] **Error Handling**: Test with network disconnected
- [ ] **Search Feature**: Try searching for "pasta"
- [ ] **Filter Feature**: Click "Vegetarian" category
- [ ] **Refresh**: Click refresh button to reload data
- [ ] **Details**: Expand recipe to see ingredients

---

## 🎓 Academic Submission

This implementation fulfills all requirements of the lab:

### Lab Requirements
1. ✅ Integrate external API (TheMealDB)
2. ✅ Fetch remote data using GET requests (fetch API)
3. ✅ Parse JSON responses (response.json())
4. ✅ Display data in user-friendly interface (cards/lists)
5. ✅ Implement loading states (skeleton + spinners)
6. ✅ Implement error handling (try-catch + error UI)

### Additional Features
- ✅ Search functionality
- ✅ Category filtering
- ✅ Refresh capability
- ✅ Expandable details
- ✅ Empty state handling
- ✅ Responsive design
- ✅ Context-relevant feature (menu inspiration)

---

## 🐛 Troubleshooting

### Issue: Recipes not loading
**Solution**: Check internet connection and browser console for errors

### Issue: Blank page
**Solution**: Check that all files are saved and dev server is running

### Issue: Navigation not working
**Solution**: Verify you're logged in and on dashboard

### Issue: Search returns no results
**Solution**: Try different search terms (e.g., "chicken", "pasta", "cake")

---

## 📞 Support

For questions about this implementation:
1. Read the code comments in each file
2. Check browser console for error messages
3. Verify all files are created in correct locations
4. Ensure dev server is running (`npm run dev`)

---

**Implementation Date**: March 1, 2026  
**Developer**: GitHub Copilot (Claude Sonnet 4.5)  
**Framework**: React + Vite + TailwindCSS  
**API**: TheMealDB (free tier)  
**Status**: ✅ Complete and Tested
